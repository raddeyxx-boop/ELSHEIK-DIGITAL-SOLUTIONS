import { signIn } from "@/app/admin/login/actions";
import styles from "./admin.module.css";
export function LoginForm({
  configured,
  error,
}: {
  configured: boolean;
  error?: boolean;
}) {
  return (
    <form className={styles.loginForm} action={signIn}>
      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={!configured}
        />
      </label>
      <label>
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          disabled={!configured}
        />
      </label>
      {!configured && (
        <p className={styles.notice}>
          Supabase authentication is not configured. Add the public Supabase
          environment values to enable secure login.
        </p>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          Authentication failed. Check your credentials and try again.
        </p>
      )}
      <button className="button button-primary" disabled={!configured}>
        Sign in securely
      </button>
    </form>
  );
}
