import { TextField, Button } from "@mui/material";
import { useRef, useState } from "react";
import useAPI from "../../actions/useAPI";
import "./Login.css";
import { useTranslation } from "react-i18next";
import useGlobalState from "../../actions/useGlobalState";

const Login = () => {
  const { t } = useTranslation();
  const [values, setValues] = useState({ password: "", username: "" });
  const { setUser, setIsLoggedIn } = useGlobalState();
  const { onLogin } = useAPI();
  const loginRef = useRef(null);
  const onInputChange = (e) => setValues({ ...values, [e.target.id]: e.target.value });

  const onSubmit = async () => {
    const resp = await onLogin(values);
    if (!resp) return;
    setUser(resp.user);
    setIsLoggedIn(true);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      loginRef.current?.click();
    }
  };

  return (
    <div className="login">
      <img src="../../LOGO.svg" alt="" />
      <div className="flex-col gap-8">
        <TextField
          className="login-input"
          id="username"
          placeholder={t("username")}
          onChange={onInputChange}
          value={values.username}
          onKeyDown={handleKeyDown}
        />
        <TextField
          className="login-input"
          id="password"
          placeholder={t("password")}
          type="password"
          onChange={onInputChange}
          value={values.password}
          onKeyDown={handleKeyDown}
        />
        <Button ref={loginRef} variant="contained" onClick={onSubmit}>
          {t("login")}
        </Button>
      </div>
    </div>
  );
};

export default Login;
