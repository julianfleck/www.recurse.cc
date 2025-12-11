#!/bin/bash

# Test script for model API key endpoints
# Replace these variables with your actual values:
API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
AUTH_TOKEN="${AUTH_TOKEN:-your-auth-token-here}"

echo "=== Testing Model API Key Endpoints ==="
echo ""

# 1. GET all model API keys
echo "1. GET /users/me/model-api-keys/"
curl -X GET "${API_BASE_URL}/users/me/model-api-keys/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -v
echo -e "\n\n"

# 2. POST - Create a new model API key
echo "2. POST /users/me/model-api-keys/"
curl -X POST "${API_BASE_URL}/users/me/model-api-keys/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "api_key": "sk-test123456789012345678901234567890",
    "model_pattern": "gpt-4o",
    "is_active": true
  }' \
  -v
echo -e "\n\n"

# 3. PATCH - Update an existing model API key (replace KEY_ID with actual ID)
echo "3. PATCH /users/me/model-api-keys/{KEY_ID}/"
echo "Example: Update both api_key and model_pattern"
curl -X PATCH "${API_BASE_URL}/users/me/model-api-keys/KEY_ID/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk-new123456789012345678901234567890",
    "model_pattern": "gpt-4o-mini"
  }' \
  -v
echo -e "\n\n"

# 4. PATCH - Update only model_pattern (when API key hasn't changed)
echo "4. PATCH /users/me/model-api-keys/{KEY_ID}/ - Update only model_pattern"
curl -X PATCH "${API_BASE_URL}/users/me/model-api-keys/KEY_ID/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model_pattern": "gpt-4o"
  }' \
  -v
echo -e "\n\n"

echo "=== Request Format Summary ==="
echo ""
echo "CREATE (POST /users/me/model-api-keys/):"
echo '  {
    "provider": "openai",
    "api_key": "sk-...",
    "model_pattern": "gpt-4o" | null,
    "is_active": true
  }'
echo ""
echo "UPDATE (PATCH /users/me/model-api-keys/{id}/):"
echo '  {
    "api_key": "sk-...",           // optional
    "model_pattern": "gpt-4o" | null,  // optional
    "is_active": true | false      // optional
  }'

