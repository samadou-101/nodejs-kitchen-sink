import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "#features/auth-admin/components/AdminLoginForm";
import { AdminSignupForm } from "#features/auth-admin/components/AdminSignupForm";
import { EmployeeLoginForm } from "#features/auth-employee/components/EmployeeLoginForm";
import { EmployeeSignupForm } from "#features/auth-employee/components/EmployeeSignupForm";

interface LoginPageProps {
  type: "admin" | "employee";
  login?: boolean;
}

export function LoginPage({ type, login }: LoginPageProps) {
  const navigate = useNavigate();
  const redirectPath = type === "admin" ? "/admin" : "/employee";

  const onSuccess = () => navigate(redirectPath);

  const SwitchLink = () => {
    const text = login
      ? `${type === "admin" ? "Admin" : "Employee"} Sign Up`
      : `${type === "admin" ? "Admin" : "Employee"} Login`;
    const href = login
      ? `/${type}/${type === "admin" ? "signup" : "signup"}`
      : `/${type}/login`;

    return (
      <a href={href} className="text-sm text-primary underline">
        {text}
      </a>
    );
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <SwitchLink />
      <div className="mt-4">
        {type === "admin" && login && <AdminLoginForm onSuccess={onSuccess} />}
        {type === "admin" && !login && <AdminSignupForm onSuccess={onSuccess} />}
        {type === "employee" && login && (
          <EmployeeLoginForm onSuccess={onSuccess} />
        )}
        {type === "employee" && !login && (
          <EmployeeSignupForm onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}
