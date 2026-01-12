"use client"

import { useAdminLogin } from "../context/AdminContext"

export function LoginForm() {
  const { handleLogin, setPassword, password, message } = useAdminLogin()

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px"
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px", textAlign: "center" }}>
          锦秋基金 - 管理后台
        </h1>
        <input
          type="password"
          placeholder="请输入管理密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "16px"
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#225BBA",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          登录
        </button>
        {message && (
          <p style={{ color: "red", marginTop: "16px", textAlign: "center" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
