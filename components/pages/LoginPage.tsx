import ButtonLogin from "../account/ButtonLogin.tsx";
import Page from "./Page.tsx";

interface Props {
  title?: string;
}

export default function LoginPage(props: Props) {
  return (
    <Page title={props.title || "Log in"} header={{ linkHome: true }}>
      <h2>Sign in to continue</h2>
      <ButtonLogin />
    </Page>
  );
}
