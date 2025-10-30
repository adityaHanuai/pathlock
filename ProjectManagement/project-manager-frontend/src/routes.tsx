import { Navigate } from "react-router-dom";
import { useContext, type JSX } from "react";
import { AuthContext } from "./context/AuthContext";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
