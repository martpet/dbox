import ButtonLogin from "./ButtonLogin.tsx";

interface Props {
  skipLogin?: boolean;
  skipReg?: boolean;
}

export default function LoginOrReg({ skipLogin, skipReg }: Props) {
  return (
    <div class="login-or-reg">
      {!skipReg && <a href="/signup">Join</a>}
      {!skipLogin && (
        <>
          or <ButtonLogin />
        </>
      )}
    </div>
  );
}
