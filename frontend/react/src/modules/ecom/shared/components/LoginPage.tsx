import { useNavigate } from "react-router-dom";
import { AdminLoginForm } from "#ecom/features/auth-admin/components/AdminLoginForm";
import { AdminSignupForm } from "#ecom/features/auth-admin/components/AdminSignupForm";
import { EmployeeLoginForm } from "#ecom/features/auth-employee/components/EmployeeLoginForm";
import { EmployeeSignupForm } from "#ecom/features/auth-employee/components/EmployeeSignupForm";
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card";

interface LoginPageProps {
  type: "admin" | "employee";
  login?: boolean;
}

export function LoginPage({ type, login }: LoginPageProps) {
  const navigate = useNavigate();
  const redirectPath = type === "admin" ? "/admin" : "/employee";

  const onSuccess = () => navigate(redirectPath);

  const switchHref = login
    ? `/${type}/signup`
    : `/${type}/login`;

  const switchText = login
    ? `${type === "admin" ? "Admin" : "Employee"} Sign Up`
    : `${type === "admin" ? "Admin" : "Employee"} Login`;

  const title = login
    ? `${type === "admin" ? "Admin" : "Employee"} Login`
    : `${type === "admin" ? "Admin" : "Employee"} Sign Up`;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {type === "admin" && login && <AdminLoginForm onSuccess={onSuccess} />}
          {type === "admin" && !login && <AdminSignupForm onSuccess={onSuccess} />}
          {type === "employee" && login && (
            <EmployeeLoginForm onSuccess={onSuccess} />
          )}
          {type === "employee" && !login && (
            <EmployeeSignupForm onSuccess={onSuccess} />
          )}
          <div className="mt-4 text-center">
            <a href={switchHref} className="text-sm font-medium text-primary underline-offset-4 hover:underline">{switchText}</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
