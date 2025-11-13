import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface SignupEmailProps {
	name: string;
	email: string;
	projectDescription: string;
	isConfirmation?: boolean;
}

export const SignupEmail = ({
	name,
	email,
	projectDescription,
	isConfirmation = false,
}: SignupEmailProps) => {
	if (isConfirmation) {
		return (
			<Html>
				<Head />
				<Preview>Welcome to the Recurse beta!</Preview>
				<Body style={main}>
					<Container style={container}>
						<Section>
							<Text style={heading}>Thanks for joining the Recurse beta!</Text>
							<Text style={text}>Hi {name},</Text>
							<Text style={text}>
								Thank you for your interest in Recurse! We&apos;re excited to
								have you join our closed beta.
							</Text>
							<Text style={text}>
								We&apos;ll be in touch soon with early access and updates about
								the platform.
							</Text>
							<Text style={text}>
								Best regards,
								<br />
								The Recurse Team
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		);
	}

	return (
		<Html>
			<Head />
			<Preview>New beta signup from {name}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section>
						<Text style={heading}>New Beta Signup</Text>
						<Text style={text}>
							<strong>Name:</strong> {name}
						</Text>
						<Text style={text}>
							<strong>Email:</strong> {email}
						</Text>
						<Hr style={hr} />
						<Text style={text}>
							<strong>Project Description:</strong>
						</Text>
						<Text style={text}>{projectDescription}</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
};

// Styles
const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
};

const heading = {
	fontSize: "24px",
	letterSpacing: "-0.5px",
	lineHeight: "1.3",
	fontWeight: "400",
	color: "#484848",
	padding: "17px 0 0",
};

const text = {
	margin: "0 0 10px 0",
	fontSize: "15px",
	lineHeight: "1.4",
	color: "#3c4149",
};

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
};

export default SignupEmail;
