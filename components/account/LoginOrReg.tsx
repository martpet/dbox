import ButtonLogin from "./ButtonLogin.tsx";

interface Props {
  skipLogin?: boolean;
  skipReg?: boolean;
}

export default function LoginOrReg({ skipLogin, skipReg }: Props) {
  return (
    <div class="login-or-reg">
      {!skipReg && <a href="/signup">Create Account</a>}
      {!skipLogin && <ButtonLogin />}
    </div>
  );
}
