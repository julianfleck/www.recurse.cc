// import type { ApiService } from '@/services/api';

// Helper function to check if a node ID represents metadata
function _isMetadataNodeId(id: string): boolean {
  const lower = id.toLowerCase();
  return (
    lower.startsWith("tag:") ||
    lower.startsWith("hyponym:") ||
    lower.startsWith("hypernym:") ||
    lower.startsWith("tag_") ||
    lower.startsWith("hyponym_") ||
    lower.startsWith("hypernym_")
  );
}

// Reusable regex declared at top-level per lint guidance
const ID_SPLIT_REGEX = /[:_]/;

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  summary?: string | null;
  tags?: string[];
  hyponyms?: string[];
  hypernyms?: string[];
  created_at?: string;
  updated_at?: string;
  index?: number;
  hasChildren?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface HierarchicalNode {
  id: string;
  title: string;
  type: string;
  summary: string | null;
  depth: number;
  parentId: string | null;
  children: HierarchicalNode[];
  hasChildren: boolean;
  childCount: number;
  isExpanded: boolean;
  index?: number;
  created_at?: string;
}

export interface FlatNode extends HierarchicalNode {
  isVisible: boolean;
  isMatch: boolean;
  isAncestor: boolean;
}

export interface ProcessedSidePanelData {
  flatNodes: FlatNode[];
  hierarchicalNodes: HierarchicalNode[];
  isLoading: boolean;
  error: string | null;
  fetchedNodes: Set<string>;
  childrenCache?: Map<string, HierarchicalNode[]>;
}

type SearchNode = {
  id: string;
  type?: string;
  title?: string | null;
  summary?: string | null;
  created_at?: string;
  updated_at?: string;
  index?: number | null;
  children?: SearchNode[];
  metadata?: {
    tags?: string[];
    hypernyms?: string[];
    hyponyms?: string[];
  };
  // Legacy fallbacks
  tags?: string[];
  hypernyms?: string[];
  hyponyms?: string[];
};

export class GraphDataManager {
  private fetchedNodes = new Set<string>();
  private expandedChildren = new Map<string, Set<string>>();
  // Normalize metadata (kind + title) to a stable id to prevent duplicates
  private metadataRegistry = new Map<string, string>();
  private onDataUpdate?: (data: GraphData) => void;
  private apiService?: any; // Made optional for standalone mode
  private onError: (error: Error) => void;

  constructor(
    apiService: any, // Made optional for standalone mode
    onDataUpdate: (data: GraphData) => void,
    onError: (error: Error) => void
  ) {
    this.apiService = apiService;
    this.onDataUpdate = onDataUpdate;
    this.onError = onError;
  }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "_");
  }

  private getOrRegisterMetaId(
    kind: "tag" | "hypernym" | "hyponym",
    title: string,
    realId?: string
  ): string {
    const key = `${kind}:${this.slugify(title)}`;
    const existing = this.metadataRegistry.get(key);
    if (existing) {
      return existing;
    }
    const id = realId || key;
    this.metadataRegistry.set(key, id);
    return id;
  }

  /**
   * Reset the fetched nodes state (useful when collapsing all nodes)
   */
  resetFetchedState(): void {
    this.fetchedNodes.clear();
    this.expandedChildren.clear();
  }

  /**
   * Load data from provided JSON instead of API calls
   */
  async loadFromJSON(jsonData: any): Promise<{
    nodes: GraphNode[];
    links: GraphLink[];
  }> {
    try {
      const _tStart =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const seen = new Set<string>();

      const ensureNode = (n: {
        id: string;
        title: string | null;
        type: string;
        summary?: string | null;
        created_at?: string;
        updated_at?: string;
        index?: number | null;
      }): void => {
        if (seen.has(n.id)) {
          return;
        }
        seen.add(n.id);
        nodes.push({
          id: n.id,
          title: n.title ?? "Untitled",
          type: n.type,
          summary: n.summary,
          created_at: n.created_at,
          updated_at: n.updated_at,
          index: typeof n.index === "number" ? n.index : undefined,
          hasChildren: false,
        });
      };

      const upsertMetadata = (
        ownerId: string,
        kind: "tag" | "hypernym" | "hyponym",
        values?: string[]
      ): void => {
        if (!values || values.length === 0) {
          return;
        }
        for (const v of values) {
          const title = v;
          const metaId = this.getOrRegisterMetaId(kind, title);
          // Only create the node once
          if (!seen.has(metaId)) {
            ensureNode({ id: metaId, title, type: kind });
          }
          links.push({ source: ownerId, target: metaId });
        }
      };

      const getMetaList = (
        obj: unknown,
        key: "tags" | "hypernyms" | "hyponyms"
      ): string[] | undefined => {
        if (obj && typeof obj === "object") {
          const meta = (obj as { metadata?: unknown }).metadata;
          if (meta && typeof meta === "object") {
            const fromMetadata = (meta as Record<string, unknown>)[key];
            if (Array.isArray(fromMetadata) && fromMetadata.length > 0) {
              return (fromMetadata as unknown[]).filter(
                (v): v is string => typeof v === "string"
              );
            }
          }
          const legacy = (obj as Record<string, unknown>)[key];
          if (Array.isArray(legacy) && legacy.length > 0) {
            return (legacy as unknown[]).filter(
              (v): v is string => typeof v === "string"
            );
          }
        }
        return [];
      };

      const walk = (sn: any, parentId?: string) => {
        // Canonicalize metadata node ids to avoid duplicates
        const typeLower = (sn.type || "").toLowerCase();
        const idLower = (sn.id || "").toLowerCase();
        let nodeIdToUse: string = sn.id;
        if (
          typeLower === "tag" ||
          typeLower === "hypernym" ||
          typeLower === "hyponym" ||
          typeLower === "metadata" ||
          idLower.startsWith("tag:") ||
          idLower.startsWith("hyponym:") ||
          idLower.startsWith("hypernym:") ||
          idLower.startsWith("tag_") ||
          idLower.startsWith("hyponym_") ||
          idLower.startsWith("hypernym_")
        ) {
          let kind: "tag" | "hypernym" | "hyponym" | null = null;
          if (typeLower === "tag" || idLower.startsWith("tag")) {
            kind = "tag";
          } else if (
            typeLower === "hypernym" ||
            idLower.startsWith("hypernym")
          ) {
            kind = "hypernym";
          } else if (typeLower === "hyponym" || idLower.startsWith("hyponym")) {
            kind = "hyponym";
          }
          if (kind) {
            const title = (sn.title || "").toString();
            nodeIdToUse = this.getOrRegisterMetaId(
              kind,
              title || idLower.split(ID_SPLIT_REGEX)[1] || idLower,
              sn.id
            );
          }
        }

        // Create/ensure owner node with canonical id
        ensureNode({ ...sn, id: nodeIdToUse });
        if (parentId) {
          links.push({ source: parentId, target: nodeIdToUse });
        }

        // Connect metadata arrays from sn.metadata (fallback to legacy arrays)
        upsertMetadata(nodeIdToUse, "tag", getMetaList(sn, "tags"));
        upsertMetadata(nodeIdToUse, "hypernym", getMetaList(sn, "hypernyms"));
        upsertMetadata(nodeIdToUse, "hyponym", getMetaList(sn, "hyponyms"));

        // Create links to children and recurse
        const childNodes = Array.isArray(sn.children) ? sn.children : [];
        for (const ch of childNodes) {
          const childId = ch.id;
          if (childId) {
            links.push({ source: nodeIdToUse, target: childId });
          }
          walk(ch, nodeIdToUse);
        }
      };

      // Process the provided JSON data
      if (jsonData?.nodes) {
        for (const root of jsonData.nodes) {
          walk(root, undefined);
        }
      }

      // Process external links if provided (for graph format data)
      if (jsonData?.links && Array.isArray(jsonData.links)) {
        for (const link of jsonData.links) {
          if (link.source && link.target) {
            const sourceId =
              typeof link.source === "string" ? link.source : link.source.id;
            const targetId =
              typeof link.target === "string" ? link.target : link.target.id;

            // Ensure both nodes exist before adding the link
            if (seen.has(sourceId) && seen.has(targetId)) {
              links.push({ source: sourceId, target: targetId });
            }
          }
        }
      }

      // Sort nodes for stable presentation: documents first, then by index/title
      nodes.sort((a, b) => {
        const at = (a.type || "").toLowerCase();
        const bt = (b.type || "").toLowerCase();
        const aIsDoc =
          at === "document" || at.startsWith("document:") || at === "folder";
        const bIsDoc =
          bt === "document" || bt.startsWith("document:") || bt === "folder";
        if (aIsDoc !== bIsDoc) {
          return aIsDoc ? -1 : 1;
        }
        const ai =
          typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
        const bi =
          typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
        if (ai !== bi) {
          return ai - bi;
        }
        return (a.title || "").localeCompare(b.title || "");
      });

      const _tEnd =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      // Mark all nodes from the JSON as fetched to prevent redundant fetchChildren calls
      const allNodeIds = new Set<string>();
      const collectNodeIds = (nodeList: any[]) => {
        for (const node of nodeList) {
          if (node.id) {
            allNodeIds.add(node.id);
          }
          if (node.children && Array.isArray(node.children)) {
            collectNodeIds(node.children);
          }
        }
      };
      if (jsonData.nodes) {
        collectNodeIds(jsonData.nodes);
      }
      for (const nodeId of allNodeIds) {
        this.fetchedNodes.add(nodeId);
      }

      this.onDataUpdate?.({ nodes, links });
      return { nodes, links };
    } catch (error) {
      this.onError(error as Error);
      return { nodes: [], links: [] };
    }
  }

  /**
   * Load initial documents with their full tree structure
   */
  async loadInitialDocuments(): Promise<{
    nodes: GraphNode[];
    links: GraphLink[];
  }> {
    try {
      const _tStart =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      // Use unified search to fetch documents and their tree structure with sufficient depth
      const limit = 100;
      const res = await this.apiService.search({
        query: "type:document",
        depth: 3,
        field_set: "metadata",
        page: 1,
        limit,
      });
      const _tAfterApi =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const seen = new Set<string>();

      const ensureNode = (n: {
        id: string;
        title: string | null;
        type: string;
        summary?: string | null;
        created_at?: string;
        updated_at?: string;
        index?: number | null;
      }): void => {
        if (seen.has(n.id)) {
          return;
        }
        seen.add(n.id);
        nodes.push({
          id: n.id,
          title: n.title ?? "Untitled",
          type: n.type,
          summary: n.summary,
          created_at: n.created_at,
          updated_at: n.updated_at,
          index: typeof n.index === "number" ? n.index : undefined,
          hasChildren: false,
        });
      };

      const upsertMetadata = (
        ownerId: string,
        kind: "tag" | "hypernym" | "hyponym",
        values?: string[]
      ): void => {
        if (!values || values.length === 0) {
          return;
        }
        for (const v of values) {
          const title = v;
          const metaId = this.getOrRegisterMetaId(kind, title);
          // Only create the node once
          if (!seen.has(metaId)) {
            ensureNode({ id: metaId, title, type: kind });
          }
          links.push({ source: ownerId, target: metaId });
        }
      };

      const getMetaList = (
        obj: unknown,
        key: "tags" | "hypernyms" | "hyponyms"
      ): string[] | undefined => {
        if (obj && typeof obj === "object") {
          const meta = (obj as { metadata?: unknown }).metadata;
          if (meta && typeof meta === "object") {
            const fromMetadata = (meta as Record<string, unknown>)[key];
            if (Array.isArray(fromMetadata) && fromMetadata.length > 0) {
              return (fromMetadata as unknown[]).filter(
                (v): v is string => typeof v === "string"
              );
            }
          }
          const legacy = (obj as Record<string, unknown>)[key];
          if (Array.isArray(legacy) && legacy.length > 0) {
            return (legacy as unknown[]).filter(
              (v): v is string => typeof v === "string"
            );
          }
        }
        return [];
      };

      const walk = (sn: SearchNode, parentId?: string) => {
        // Canonicalize metadata node ids to avoid duplicates
        const typeLower = (sn.type || "").toLowerCase();
        const idLower = (sn.id || "").toLowerCase();
        let nodeIdToUse: string = sn.id;
        if (
          typeLower === "tag" ||
          typeLower === "hypernym" ||
          typeLower === "hyponym" ||
          typeLower === "metadata" ||
          idLower.startsWith("tag:") ||
          idLower.startsWith("hyponym:") ||
          idLower.startsWith("hypernym:") ||
          idLower.startsWith("tag_") ||
          idLower.startsWith("hyponym_") ||
          idLower.startsWith("hypernym_")
        ) {
          let kind: "tag" | "hypernym" | "hyponym" | null = null;
          if (typeLower === "tag" || idLower.startsWith("tag")) {
            kind = "tag";
          } else if (
            typeLower === "hypernym" ||
            idLower.startsWith("hypernym")
          ) {
            kind = "hypernym";
          } else if (typeLower === "hyponym" || idLower.startsWith("hyponym")) {
            kind = "hyponym";
          }
          if (kind) {
            const title = (sn.title || "").toString();
            nodeIdToUse = this.getOrRegisterMetaId(
              kind,
              title || idLower.split(ID_SPLIT_REGEX)[1] || idLower,
              sn.id
            );
          }
        }

        // Create/ensure owner node with canonical id
        ensureNode({ ...sn, id: nodeIdToUse });
        if (parentId) {
          links.push({ source: parentId, target: nodeIdToUse });
        }

        // Connect metadata arrays from sn.metadata (fallback to legacy arrays)
        upsertMetadata(nodeIdToUse, "tag", getMetaList(sn, "tags"));
        upsertMetadata(nodeIdToUse, "hypernym", getMetaList(sn, "hypernyms"));
        upsertMetadata(nodeIdToUse, "hyponym", getMetaList(sn, "hyponyms"));

        // Recurse children
        const childNodes = Array.isArray(sn.children) ? sn.children : [];
        for (const ch of childNodes) {
          walk(ch, nodeIdToUse);
        }
      };

      for (const root of res.nodes) {
        walk(root, undefined);
      }

      // Sort nodes for stable presentation: documents first, then by index/title
      nodes.sort((a, b) => {
        const at = (a.type || "").toLowerCase();
        const bt = (b.type || "").toLowerCase();
        const aIsDoc =
          at === "document" || at.startsWith("document:") || at === "folder";
        const bIsDoc =
          bt === "document" || bt.startsWith("document:") || bt === "folder";
        if (aIsDoc !== bIsDoc) {
          return aIsDoc ? -1 : 1;
        }
        const ai =
          typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
        const bi =
          typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
        if (ai !== bi) {
          return ai - bi;
        }
        return (a.title || "").localeCompare(b.title || "");
      });

      const _tEnd =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      // Mark all nodes from initial load as fetched to prevent redundant fetchChildren calls
      const allNodeIds = new Set<string>();
      const collectNodeIds = (nodeList: SearchNode[]) => {
        for (const node of nodeList) {
          if (node.id) {
            allNodeIds.add(node.id);
          }
          if (node.children && Array.isArray(node.children)) {
            collectNodeIds(node.children);
          }
        }
      };
      collectNodeIds(res.nodes || []);
      for (const nodeId of allNodeIds) {
        this.fetchedNodes.add(nodeId);
      }

      this.onDataUpdate?.({ nodes, links });
      return { nodes, links };
    } catch (error) {
      this.onError(error as Error);
      return { nodes: [], links: [] };
    }
  }

  /**
   * Fetch children for a specific node
   */
  async fetchChildren(
    nodeId: string,
    forceRefetch = false
  ): Promise<{ nodes: GraphNode[]; links: GraphLink[] } | null> {
    if (this.fetchedNodes.has(nodeId) && !forceRefetch) {
      return null; // Already fetched
    }

    // In standalone mode without API service, all data should already be loaded
    if (!this.apiService) {
      return null;
    }

    try {
      // Prefer unified search by id for consistency with initial load
      const res = await this.apiService.search({
        id: nodeId,
        // Only fetch one level of children to avoid over-expansion
        depth: 1,
        field_set: "metadata",
        // page/limit not relevant for id lookup
      });

      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];
      const childrenIds = new Set<string>();
      const seen = new Set<string>();

      const ensureNode = (n: {
        id: string;
        title: string | null;
        type: string;
        summary?: string | null;
        created_at?: string;
        updated_at?: string;
        index?: number | null;
      }): void => {
        if (seen.has(n.id)) {
          return;
        }
        seen.add(n.id);
        newNodes.push({
          id: n.id,
          title: n.title ?? "Untitled",
          type: n.type,
          summary: n.summary,
          created_at: n.created_at,
          updated_at: n.updated_at,
          index: typeof n.index === "number" ? n.index : undefined,
          hasChildren: false,
        });
      };

      const upsertMetadata = (
        ownerId: string,
        kind: "tag" | "hypernym" | "hyponym",
        values?: string[]
      ) => {
        if (!values || values.length === 0) {
          return;
        }
        for (const v of values) {
          const title = v;
          const metaId = this.getOrRegisterMetaId(kind, title);
          if (!seen.has(metaId)) {
            ensureNode({ id: metaId, title, type: kind });
          }
          newLinks.push({ source: ownerId, target: metaId });
        }
      };

      const getMetaList = (
        obj: unknown,
        key: "tags" | "hypernyms" | "hyponyms"
      ): string[] | undefined => {
        if (obj && typeof obj === "object") {
          const meta = (obj as { metadata?: unknown }).metadata;
          if (meta && typeof meta === "object") {
            const fromMetadata = (meta as Record<string, unknown>)[key];
            if (Array.isArray(fromMetadata) && fromMetadata.length > 0) {
              return (fromMetadata as unknown[]).filter(
                (v): v is string => typeof v === "string"
              );
            }
          }
          const legacy = (obj as Record<string, unknown>)[key];
          if (Array.isArray(legacy) && legacy.length > 0) {
            return (legacy as unknown[]).filter(
              (v): v is string => typeof v === "string"
            );
          }
        }
        return [];
      };

      const rootId = nodeId;
      const walk = (sn: SearchNode, parentId?: string, depthLeft = 1) => {
        // Canonicalize potential metadata node ids
        const typeLower = (sn.type || "").toLowerCase();
        const idLower = (sn.id || "").toLowerCase();
        let nodeIdToUse: string = sn.id;
        if (
          typeLower === "tag" ||
          typeLower === "hypernym" ||
          typeLower === "hyponym" ||
          typeLower === "metadata" ||
          idLower.startsWith("tag:") ||
          idLower.startsWith("hyponym:") ||
          idLower.startsWith("hypernym:") ||
          idLower.startsWith("tag_") ||
          idLower.startsWith("hyponym_") ||
          idLower.startsWith("hypernym_")
        ) {
          let kind: "tag" | "hypernym" | "hyponym" | null = null;
          if (typeLower === "tag" || idLower.startsWith("tag")) {
            kind = "tag";
          } else if (
            typeLower === "hypernym" ||
            idLower.startsWith("hypernym")
          ) {
            kind = "hypernym";
          } else if (typeLower === "hyponym" || idLower.startsWith("hyponym")) {
            kind = "hyponym";
          }
          if (kind) {
            const title = (sn.title || "").toString();
            nodeIdToUse = this.getOrRegisterMetaId(
              kind,
              title || idLower.split(ID_SPLIT_REGEX)[1] || idLower,
              sn.id
            );
          }
        }

        ensureNode({ ...sn, id: nodeIdToUse });
        if (parentId) {
          // Only treat direct children of the requested node as children
          if (parentId === rootId) {
            childrenIds.add(nodeIdToUse);
          }
          newLinks.push({ source: parentId, target: nodeIdToUse });
        }
        upsertMetadata(nodeIdToUse, "tag", getMetaList(sn, "tags"));
        upsertMetadata(nodeIdToUse, "hypernym", getMetaList(sn, "hypernyms"));
        upsertMetadata(nodeIdToUse, "hyponym", getMetaList(sn, "hyponyms"));

        const childNodes = Array.isArray(sn.children) ? sn.children : [];
        if (depthLeft > 0) {
          for (const ch of childNodes) {
            walk(ch, nodeIdToUse, depthLeft - 1);
          }
        }
      };

      for (const root of res.nodes) {
        walk(root, undefined, 1);
      }

      // Mark as fetched and track children
      this.fetchedNodes.add(nodeId);
      this.expandedChildren.set(nodeId, childrenIds);

      // Sort nodes by index then title
      newNodes.sort((a, b) => {
        const ai =
          typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
        const bi =
          typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
        if (ai !== bi) {
          return ai - bi;
        }
        return (a.title || "").localeCompare(b.title || "");
      });

      // Deduplicate links
      const linkMap = new Map<string, GraphLink>();
      for (const link of newLinks) {
        const s =
          typeof link.source === "string" ? link.source : link.source.id;
        const t =
          typeof link.target === "string" ? link.target : link.target.id;
        linkMap.set(`${s}->${t}`, link);
      }
      const uniqueLinks = Array.from(linkMap.values());

      this.onDataUpdate?.({ nodes: [...newNodes], links: uniqueLinks });
      return { nodes: newNodes, links: uniqueLinks };
    } catch (error) {
      this.onError(error as Error);
      return null;
    }
  }

  /**
   * Check if node has been fetched
   */
  hasFetched(nodeId: string): boolean {
    return this.fetchedNodes.has(nodeId);
  }

  /**
   * Reset fetched status for a node (useful when collapsing)
   */
  resetFetchedStatus(nodeId: string): void {
    this.fetchedNodes.delete(nodeId);
    this.expandedChildren.delete(nodeId);
  }

  /**
   * Get children IDs for a node
   */
  getChildrenIds(nodeId: string): Set<string> {
    return this.expandedChildren.get(nodeId) || new Set();
  }

  /**
   * Reset fetched state (useful for testing or data refresh)
   */
  reset(): void {
    this.fetchedNodes.clear();
    this.expandedChildren.clear();
  }

  /**
   * Debug method to get metadata information (for development)
   */
  // removed getMetadataInfo; metadata nodes are part of nodes now

  // Hierarchy and filtering methods moved from GraphSidePanel

  /**
   * Check if a node type is a document type
   */
  private isDocumentType(type: string): boolean {
    const t = (type || "").toLowerCase();
    return t === "document" || t.startsWith("document:") || t === "folder";
  }

  /**
   * Compare nodes by index, then created_at, then title for sorting
   */
  private compareNodesByIndexThenTitle(
    a: HierarchicalNode,
    b: HierarchicalNode
  ): number {
    // Sort by index ascending; missing index last
    const ai = typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
    const bi = typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
    if (ai !== bi) {
      return ai - bi;
    }

    // Sort by created_at descending; missing created_at last
    if (a.created_at && b.created_at) {
      const dateComparison =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
    } else if (a.created_at && !b.created_at) {
      return -1;
    } else if (!a.created_at && b.created_at) {
      return 1;
    }

    // Fall back to title comparison
    return a.title.localeCompare(b.title);
  }

  /**
   * Build hierarchical structure from flat nodes and parent relationships
   */
  buildHierarchy(
    nodesById: Map<string, GraphNode>,
    parentByChildId: Map<string, string>,
    expandedNodes: Set<string>,
    childrenCache: Map<string, HierarchicalNode[]>
  ): HierarchicalNode[] {
    // Create hierarchical node map
    const nodeMap = new Map<string, HierarchicalNode>();
    for (const [id, node] of nodesById) {
      const hierarchicalNode: HierarchicalNode = {
        id: node.id,
        title: node.title,
        type: node.type,
        summary: node.summary ?? null,
        depth: 0,
        children: [],
        hasChildren: false,
        childCount: 0,
        isExpanded: expandedNodes.has(id),
        index: node.index ?? undefined,
        parentId: null,
      };
      nodeMap.set(id, hierarchicalNode);
    }

    // Calculate depths
    const calculateDepth = (
      nodeId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(nodeId)) {
        return 0;
      }
      visited.add(nodeId);
      const parentId = parentByChildId.get(nodeId);
      if (!(parentId && nodeMap.has(parentId))) {
        return 0;
      }
      return calculateDepth(parentId, visited) + 1;
    };

    for (const [id] of nodeMap) {
      const node = nodeMap.get(id)!;
      node.depth = calculateDepth(id);
    }

    // Organize hierarchy
    const rootNodes: HierarchicalNode[] = [];
    for (const [id, node] of nodeMap) {
      const parentId = parentByChildId.get(id);
      if (parentId && nodeMap.has(parentId)) {
        const parent = nodeMap.get(parentId);
        if (parent?.children) {
          parent.children.push(node);
          parent.hasChildren = true;
          parent.childCount = parent.children.length;
          node.parentId = parentId;
        }
      } else {
        rootNodes.push(node);
      }
    }

    // Primary sort by type (documents first), then by index if present, then title
    rootNodes.sort((a, b) => {
      const aIsDoc = this.isDocumentType(a.type);
      const bIsDoc = this.isDocumentType(b.type);
      if (aIsDoc !== bIsDoc) {
        return aIsDoc ? -1 : 1;
      }
      return this.compareNodesByIndexThenTitle(a, b);
    });

    // Add cached children
    for (const [parentId, cachedChildren] of childrenCache) {
      const parent = nodeMap.get(parentId);
      if (!parent) {
        continue;
      }
      const uniqueChildIds = Array.from(
        new Set(cachedChildren.map((c) => c.id))
      );
      const filteredChildIds = uniqueChildIds.filter((id) => {
        return parentByChildId.get(id) === parentId;
      });
      parent.hasChildren = filteredChildIds.length > 0;
      parent.childCount = filteredChildIds.length;
      if (parent.isExpanded) {
        parent.children = filteredChildIds
          .map((id) => nodeMap.get(id))
          .filter((n): n is HierarchicalNode => Boolean(n))
          .sort(this.compareNodesByIndexThenTitle);
      }
    }

    return rootNodes;
  }

  /**
   * Check if a node matches a filter string
   */
  private matchesFilter(node: HierarchicalNode, filter: string): boolean {
    if (!filter) {
      return true;
    }
    const raw = filter.trim();
    const lower = raw.toLowerCase();
    if (lower.startsWith("type:")) {
      const qRaw = lower.slice(5).trim();
      if (!qRaw) {
        return false;
      }
      const alias = (q: string): string => {
        if (
          q === "def" ||
          q === "defs" ||
          q === "definition" ||
          q === "definitions"
        ) {
          return "definition";
        }
        if (q === "ins" || q === "insight" || q === "insights") {
          return "insight";
        }
        if (
          q === "doc" ||
          q === "docs" ||
          q === "document" ||
          q === "documents"
        ) {
          return "document";
        }
        if (q === "folder" || q === "folders") {
          return "folder";
        }
        return q;
      };
      const q = alias(qRaw);
      const t = (node.type ?? "").toLowerCase();
      // Prefer exact match; fallback to prefix for convenience
      return t === q || t.startsWith(q);
    }
    const lf = lower;
    return (
      (node.title ?? "").toLowerCase().includes(lf) ||
      (node.summary ?? "").toLowerCase().includes(lf) ||
      (node.type ?? "").toLowerCase().includes(lf)
    );
  }

  /**
   * Compute matches and ancestors for filtering
   */
  computeMatchesAndAncestors(
    nodes: HierarchicalNode[],
    filter: string,
    parentByChildId: Map<string, string>,
    childrenCache: Map<string, HierarchicalNode[]>
  ): { matches: Set<string>; expandedForFilter: Set<string> } {
    // When there is no filter, do not auto-expand anything
    if (!filter || filter.trim() === "") {
      return {
        matches: new Set<string>(),
        expandedForFilter: new Set<string>(),
      };
    }

    const expandedForFilter = new Set<string>();
    const matches = new Set<string>();

    const markAncestors = (nodeId: string) => {
      let current = parentByChildId.get(nodeId);
      while (current) {
        expandedForFilter.add(current);
        current = parentByChildId.get(current);
      }
    };

    const getChildrenForTraversal = (node: HierarchicalNode) => {
      if (node.children && node.children.length > 0) {
        return node.children;
      }
      if (filter && childrenCache && childrenCache.has(node.id)) {
        return childrenCache.get(node.id) ?? [];
      }
      return [] as HierarchicalNode[];
    };

    const stack: HierarchicalNode[] = [...nodes];
    while (stack.length > 0) {
      const n = stack.pop() as HierarchicalNode;
      if (this.matchesFilter(n, filter)) {
        matches.add(n.id);
        markAncestors(n.id);
      }
      const children = getChildrenForTraversal(n);
      for (const c of children) {
        stack.push(c);
      }
    }
    return { matches, expandedForFilter };
  }

  /**
   * Flatten hierarchical nodes for display
   */
  flattenNodes(
    nodes: HierarchicalNode[],
    filter: string,
    expandedNodes: Set<string>,
    filterSuppressed: Set<string>,
    parentByChildId: Map<string, string>,
    childrenCache: Map<string, HierarchicalNode[]>
  ): FlatNode[] {
    const result: FlatNode[] = [];
    const { matches, expandedForFilter } = this.computeMatchesAndAncestors(
      nodes,
      filter,
      parentByChildId,
      childrenCache
    );

    const shouldDescendNode = (
      node: HierarchicalNode,
      expandedForFilter: Set<string>,
      suppressed: Set<string>
    ): boolean => {
      const autoExpand = expandedForFilter.has(node.id);
      const userSuppressed = Boolean(filter) && suppressed.has(node.id);
      const isExpanded = expandedNodes.has(node.id);
      return (isExpanded || autoExpand) && !userSuppressed;
    };

    const getImmediateChildren = (
      node: HierarchicalNode,
      isExpanded: boolean
    ): HierarchicalNode[] => {
      if (isExpanded) {
        if (node.children && node.children.length > 0) {
          return node.children;
        }
        if (childrenCache?.has(node.id)) {
          return childrenCache.get(node.id) ?? [];
        }
      }
      if (filter && childrenCache && childrenCache.has(node.id)) {
        return childrenCache.get(node.id) ?? [];
      }
      return [] as HierarchicalNode[];
    };

    const isExpandedEffective = (node: HierarchicalNode): boolean => {
      return expandedNodes.has(node.id);
    };

    const stack: HierarchicalNode[] = [...nodes];
    while (stack.length > 0) {
      const n = stack.pop() as HierarchicalNode;
      const isMatch = matches.has(n.id);
      const isAncestor =
        expandedForFilter.has(n.id) && !isMatch && Boolean(filter);
      const shouldInclude = !filter || isMatch || isAncestor;
      if (shouldInclude) {
        result.push({ ...n, isVisible: true, isMatch, isAncestor });
      }

      const expanded = isExpandedEffective(n);
      if (shouldDescendNode(n, expandedForFilter, filterSuppressed)) {
        const children = getImmediateChildren(n, expanded);
        for (const c of children) {
          stack.push(c);
        }
      }
    }
    return result;
  }

  // Static helper functions
  private static isDocumentTypeStatic(type: string): boolean {
    const t = (type || "").toLowerCase();
    return t === "document" || t.startsWith("document:") || t === "folder";
  }

  // Static utility methods for hierarchy operations (used by side panel)
  static buildHierarchyStatic(
    nodesById: Map<
      string,
      {
        id: string;
        title: string;
        type: string;
        summary?: string | null;
        index?: number;
      }
    >,
    parentByChildId: Map<string, string>,
    expandedNodes: Set<string>,
    childrenCache?: Map<string, HierarchicalNode[]>
  ): HierarchicalNode[] {
    try {
      // Implementation moved from the old buildHierarchy function
      const nodeMap = new Map<string, HierarchicalNode>();
      for (const [id, node] of nodesById) {
        // Include all nodes - visual filtering will be handled by the side panel component
        const hierarchicalNode: HierarchicalNode = {
          id: node.id,
          title: node.title,
          type: node.type,
          summary: node.summary || null,
          depth: 0,
          children: [],
          hasChildren: false, // Default value since this property isn't available in the input type
          childCount: 0,
          isExpanded: expandedNodes.has(id),
          index: node.index ?? undefined,
          // created_at not available in input type, will be undefined
          parentId: null,
        };

        nodeMap.set(id, hierarchicalNode);
      }

      // Calculate depths
      const calculateDepth = (
        nodeId: string,
        visited = new Set<string>()
      ): number => {
        if (visited.has(nodeId)) {
          return 0;
        }
        visited.add(nodeId);
        const parentId = parentByChildId.get(nodeId);
        if (!(parentId && nodeMap.has(parentId))) {
          return 0;
        }
        return calculateDepth(parentId, visited) + 1;
      };

      for (const [id] of nodeMap) {
        const node = nodeMap.get(id);
        if (node) {
          node.depth = calculateDepth(id);
        }
      }

      // Organize hierarchy
      const rootNodes: HierarchicalNode[] = [];
      for (const [id, node] of nodeMap) {
        const parentId = parentByChildId.get(id);
        if (parentId && nodeMap.has(parentId)) {
          const parent = nodeMap.get(parentId);
          if (parent?.children) {
            parent.children.push(node);
            parent.hasChildren = true;
            parent.childCount = parent.children.length;
            node.parentId = parentId;
          }
        } else {
          rootNodes.push(node);
        }
      }

      // Sort children for all nodes (when no cache is available)
      for (const node of nodeMap.values()) {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => {
            // Sort by index ascending; missing index last
            const ai =
              typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
            const bi =
              typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
            if (ai !== bi) {
              return ai - bi;
            }

            // Sort by created_at descending; missing created_at last
            if (a.created_at && b.created_at) {
              const dateComparison =
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime();
              if (dateComparison !== 0) {
                return dateComparison;
              }
            } else if (a.created_at && !b.created_at) {
              return -1;
            } else if (!a.created_at && b.created_at) {
              return 1;
            }

            // Fall back to title comparison
            return a.title.localeCompare(b.title);
          });
        }
      }

      // Primary sort by type (documents first), then by index if present, then created_at, then title
      rootNodes.sort((a, b) => {
        const aIsDoc = GraphDataManager.isDocumentTypeStatic(a.type);
        const bIsDoc = GraphDataManager.isDocumentTypeStatic(b.type);
        if (aIsDoc !== bIsDoc) {
          return aIsDoc ? -1 : 1;
        }
        // Sort by index ascending; missing index last
        const ai =
          typeof a.index === "number" ? a.index : Number.NEGATIVE_INFINITY;
        const bi =
          typeof b.index === "number" ? b.index : Number.NEGATIVE_INFINITY;
        if (ai !== bi) {
          return ai - bi;
        }
        // Sort by created_at descending; missing created_at last
        if (a.created_at && b.created_at) {
          const dateComparison =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          if (dateComparison !== 0) {
            return dateComparison;
          }
        } else if (a.created_at && !b.created_at) {
          return -1;
        } else if (!a.created_at && b.created_at) {
          return 1;
        }
        // Fall back to title comparison
        return a.title.localeCompare(b.title);
      });

      // Add cached children (if available)
      if (childrenCache) {
        for (const [parentId, cachedChildren] of childrenCache) {
          const parent = nodeMap.get(parentId);
          if (!parent) {
            continue;
          }
          const uniqueChildIds = Array.from(
            new Set(cachedChildren.map((c) => c.id))
          );
          const filteredChildIds = uniqueChildIds.filter((id) => {
            return parentByChildId.get(id) === parentId;
          });
          parent.hasChildren = filteredChildIds.length > 0;
          parent.childCount = filteredChildIds.length;
          if (parent.isExpanded) {
            parent.children = filteredChildIds
              .map((id) => nodeMap.get(id))
              .filter((n): n is HierarchicalNode => Boolean(n))
              .sort((a, b) => {
                const ai =
                  typeof a.index === "number"
                    ? a.index
                    : Number.NEGATIVE_INFINITY;
                const bi =
                  typeof b.index === "number"
                    ? b.index
                    : Number.NEGATIVE_INFINITY;
                if (ai !== bi) {
                  return ai - bi;
                }
                return a.title.localeCompare(b.title);
              });
          }
        }
      }

      return rootNodes;
    } catch (_error) {
      return [];
    }
  }

  static computeMatchesAndAncestorsStatic(
    nodes: HierarchicalNode[],
    filter: string,
    parentByChildId: Map<string, string>,
    childrenCache?: Map<string, HierarchicalNode[]>
  ): { matches: Set<string>; expandedForFilter: Set<string> } {
    const trimmed = (filter || "").trim();
    if (!trimmed) {
      return {
        matches: new Set<string>(),
        expandedForFilter: new Set<string>(),
      };
    }

    const expandedForFilter = new Set<string>();
    const matches = new Set<string>();

    // Parse tokens: support type:, tag:, hyponym:, hypernym:, metadata:, and free terms
    const tokens = trimmed.split(/\s+/g).map((t) => t.toLowerCase());
    let typeQuery: string | null = null;
    const metaQueries: {
      tag: string[];
      hyponym: string[];
      hypernym: string[];
      any: string[];
    } = {
      tag: [],
      hyponym: [],
      hypernym: [],
      any: [],
    };
    const freeTerms: string[] = [];

    const aliasType = (q: string): string => {
      if (
        q === "def" ||
        q === "defs" ||
        q === "definition" ||
        q === "definitions"
      ) {
        return "definition";
      }
      if (q === "ins" || q === "insight" || q === "insights") {
        return "insight";
      }
      if (
        q === "doc" ||
        q === "docs" ||
        q === "document" ||
        q === "documents"
      ) {
        return "document";
      }
      if (q === "folder" || q === "folders") {
        return "folder";
      }
      return q;
    };

    for (const t of tokens) {
      if (t.startsWith("type:")) {
        const v = t.slice(5).trim();
        if (v) {
          typeQuery = aliasType(v);
        }
      } else if (t.startsWith("tag:")) {
        const v = t.slice(4).trim();
        if (v) {
          metaQueries.tag.push(v);
        }
      } else if (t.startsWith("hyponym:")) {
        const v = t.slice(8).trim();
        if (v) {
          metaQueries.hyponym.push(v);
        }
      } else if (t.startsWith("hypernym:")) {
        const v = t.slice(9).trim();
        if (v) {
          metaQueries.hypernym.push(v);
        }
      } else if (t.startsWith("metadata:")) {
        const v = t.slice(9).trim();
        if (v) {
          metaQueries.any.push(v);
        }
      } else {
        freeTerms.push(t);
      }
    }

    const nodeById = new Map<string, HierarchicalNode>();
    for (const nn of nodes) {
      nodeById.set(nn.id, nn);
    }
    const isMetadataId = (id: string): boolean => {
      const lower = id.toLowerCase();
      const t = (nodeById.get(id)?.type ?? "").toLowerCase();
      return (
        t === "tag" ||
        t === "hyponym" ||
        t === "hypernym" ||
        t === "metadata" ||
        lower.startsWith("tag:") ||
        lower.startsWith("tag_") ||
        lower.startsWith("hyponym:") ||
        lower.startsWith("hyponym_") ||
        lower.startsWith("hypernym:") ||
        lower.startsWith("hypernym_")
      );
    };

    const getAssociatedMetadataIds = (nodeId: string): string[] => {
      const results: string[] = [];
      const parent = parentByChildId.get(nodeId);
      if (parent && isMetadataId(parent)) {
        results.push(parent);
      }
      for (const [childId, parentId] of parentByChildId.entries()) {
        if (parentId === nodeId && isMetadataId(childId)) {
          results.push(childId);
        }
      }
      return results;
    };

    const nodeMatches = (n: HierarchicalNode): boolean => {
      // Enforce type constraint
      if (typeQuery) {
        const nt = (n.type ?? "").toLowerCase();
        if (!(nt === typeQuery || nt.startsWith(typeQuery))) {
          return false;
        }
      }

      // Collect metadata relationships
      const metaIds = getAssociatedMetadataIds(n.id);

      const requireMeta = (
        list: string[],
        kind: "tag" | "hypernym" | "hyponym"
      ): boolean => {
        if (list.length === 0) {
          return true;
        }
        const p = `${kind}:`;
        const pu = `${kind}_`;
        return list.some((qRaw) =>
          metaIds.some((id) => {
            const lid = id.toLowerCase();
            const q = qRaw.toLowerCase();
            const metaNode = nodeById.get(id);
            const ntitle = (metaNode?.title ?? "").toLowerCase();
            const ntype = (metaNode?.type ?? "").toLowerCase();
            const isKind = ntype === kind || ntype === "metadata";
            return (
              isKind &&
              (lid.startsWith(p + q) ||
                lid.startsWith(pu + q) ||
                ntitle.includes(q))
            );
          })
        );
      };
      if (!requireMeta(metaQueries.tag, "tag")) {
        return false;
      }
      if (!requireMeta(metaQueries.hyponym, "hyponym")) {
        return false;
      }
      if (!requireMeta(metaQueries.hypernym, "hypernym")) {
        return false;
      }
      if (metaQueries.any.length > 0) {
        const ok = metaQueries.any.some((q) =>
          metaIds.some((id) => {
            const lid = id.toLowerCase();
            if (lid.includes(q)) {
              return true;
            }
            const metaNode = nodeById.get(id);
            const title = (metaNode?.title ?? "").toLowerCase();
            const type = (metaNode?.type ?? "").toLowerCase();
            return title.includes(q) || type.includes(q);
          })
        );
        if (!ok) {
          return false;
        }
      }

      // Free-text terms: match in title/summary/type or metadata ids
      if (freeTerms.length > 0) {
        const title = (n.title ?? "").toLowerCase();
        const summary = (n.summary ?? "").toLowerCase();
        const ntype = (n.type ?? "").toLowerCase();
        const metaText = metaIds.join(" ").toLowerCase();
        const hay = `${title} ${summary} ${ntype} ${metaText}`;
        for (const term of freeTerms) {
          if (!hay.includes(term)) {
            return false;
          }
        }
      }

      return true;
    };

    const markAncestors = (nodeId: string) => {
      let current = parentByChildId.get(nodeId);
      while (current) {
        expandedForFilter.add(current);
        current = parentByChildId.get(current);
      }
    };

    const getChildrenForTraversal = (node: HierarchicalNode) => {
      if (node.children && node.children.length > 0) {
        return node.children;
      }
      if (trimmed && childrenCache && childrenCache.has(node.id)) {
        return childrenCache.get(node.id) ?? [];
      }
      return [] as HierarchicalNode[];
    };

    const stack: HierarchicalNode[] = [...nodes];
    while (stack.length > 0) {
      const n = stack.pop() as HierarchicalNode;
      if (nodeMatches(n)) {
        matches.add(n.id);
        markAncestors(n.id);
      }
      const children = getChildrenForTraversal(n);
      for (const c of children) {
        stack.push(c);
      }
    }
    return { matches, expandedForFilter };
  }

  static flattenNodesStatic(
    nodes: HierarchicalNode[],
    filter: string,
    expandedNodes: Set<string>,
    filterSuppressed: Set<string>,
    parentByChildId: Map<string, string>,
    childrenCache?: Map<string, HierarchicalNode[]>
  ): FlatNode[] {
    try {
      const result: FlatNode[] = [];
      const { matches, expandedForFilter } =
        GraphDataManager.computeMatchesAndAncestorsStatic(
          nodes,
          filter,
          parentByChildId,
          childrenCache
        );

      const shouldDescendNode = (
        node: HierarchicalNode,
        expandedForFilter: Set<string>,
        suppressed: Set<string>
      ): boolean => {
        const autoExpand = expandedForFilter.has(node.id);
        const userSuppressed = Boolean(filter) && suppressed.has(node.id);
        const isExpanded = expandedNodes.has(node.id);
        return (isExpanded || autoExpand) && !userSuppressed;
      };

      const getImmediateChildren = (
        node: HierarchicalNode,
        isExpanded: boolean
      ): HierarchicalNode[] => {
        // During filtering, also descend into nodes that are auto-expanded
        const isAutoExpanded = expandedForFilter.has(node.id);
        if (isExpanded || isAutoExpanded) {
          if (node.children && node.children.length > 0) {
            return node.children;
          }
          if (childrenCache?.has(node.id)) {
            return childrenCache.get(node.id) ?? [];
          }
        }
        if (filter && childrenCache && childrenCache.has(node.id)) {
          return childrenCache.get(node.id) ?? [];
        }
        return [] as HierarchicalNode[];
      };

      const isExpandedEffective = (node: HierarchicalNode): boolean => {
        return expandedNodes.has(node.id);
      };

      const stack: HierarchicalNode[] = [...nodes];
      while (stack.length > 0) {
        const n = stack.pop() as HierarchicalNode;
        const isMatch = matches.has(n.id);
        const isAncestor =
          expandedForFilter.has(n.id) && !isMatch && Boolean(filter);
        const shouldInclude = !filter || isMatch || isAncestor;
        if (shouldInclude) {
          result.push({ ...n, isVisible: true, isMatch, isAncestor });
        }

        const expanded = isExpandedEffective(n);
        if (shouldDescendNode(n, expandedForFilter, filterSuppressed)) {
          const children = getImmediateChildren(n, expanded);
          // Push children in reverse order to counteract stack's LIFO behavior
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
          }
        }
      }

      return result;
    } catch (_error) {
      return [];
    }
  }
}
