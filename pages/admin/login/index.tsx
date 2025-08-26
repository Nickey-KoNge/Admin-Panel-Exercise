// pages/login.tsx
import React from 'react';
import { useForm , SubmitHandler} from 'react-hook-form'
import type { NextPage } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../../../styles/admin/login/login.module.scss';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

type FormInputs = {
    email: string;
    password:string;
};
const LoginPage: NextPage = () => {
   
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {register, handleSubmit, formState: {errors}} = useForm<FormInputs>();

    const onSubmit : SubmitHandler<FormInputs> = async (data) => {
        setIsLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        });
        setIsLoading(false);
        if (result?.error) {
            alert("Login failed! Please check your credentials.");
            console.error(result.error);
        } else {
            alert("Login successful!");
            router.push('/admin'); 
        }
    };

    return (
        <div className={styles.container}>
            <h1>Log in</h1>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <label htmlFor='email'>Email</label>
                <input 
                    type='email'
                    id='email'
                    placeholder= 'Please Enter Email!'
                    {...register('email', {required: "Email is required!"})}
                />
                {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}

                <label htmlFor='password'>Password</label>
                <input 
                    type='password'
                    id="password"
                    {...register ('password', {required: "Password is required!",
                        minLength: {value: 6, message: "Password must be at lease 6 character!"}
                    })}
                
                />
                {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
                <button type='submit' disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className={styles.linkText}>
                    <Link href="/register">
                        Forgot password?
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;