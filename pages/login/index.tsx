"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import type { NextPage } from "next";
import Link from "next/link";
import { signIn, useSession, getSession } from "next-auth/react";
import { showAlert } from "@/utils/toastHelper";
import styles from "@/styles/admin/login/login.module.scss";

type FormInputs = {
  email: string;
  password: string;
};

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role_id?: number; // Add this
}

const LoginPage: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession(); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsLoading(true);

  
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    
    if (result?.error) {
      showAlert("error", "Login failed! Please check your credentials.");
      console.error(result.error);
      return;
    }

    showAlert("success", "Login successful!");

   
    const checkSession = async (retries = 10) => {
      for (let i = 0; i < retries; i++) {
        const session = await getSession();
        const user = session?.user as SessionUser;
        if (user?.role_id) return user;
        await new Promise((r) => setTimeout(r, 300)); 
      }
      return null;
    };

    const user = await checkSession();

    if (!user) {
      showAlert("error", "Unable to load session. Please try again.");
      return;
    }

   
    if (user.role_id === 1) {
      window.location.href = "/admin/attendance"; 
    } else {
      window.location.href = "/checkin-out"; 
    }
  };

  
  if (status === "loading" || status === "authenticated") {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
       
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Please Enter Email!"
          {...register("email", { required: "Email is required!" })}
        />
        {errors.email && (
          <p className={styles.errorText}>{errors.email.message}</p>
        )}

       
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required!",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters!",
            },
          })}
        />
        {errors.password && (
          <p className={styles.errorText}>{errors.password.message}</p>
        )}

       
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

      
        <p className={styles.linkText}>
          <Link href="/register">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
