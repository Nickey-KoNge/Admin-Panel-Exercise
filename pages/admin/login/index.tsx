// pages/login.tsx
import type { NextPage } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../../../styles/admin/login/login.module.scss';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

const LoginPage: NextPage = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn('credentials', {
            redirect: false, 
            email: email,
            password: password,
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
            <form onSubmit={handleSubmit} className={styles.form}>
                <label htmlFor='email'>Email</label>
                <input 
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder='Please Enter Email!'
                    required
                />
                <label htmlFor='password'>Password</label>
                <input 
                    type='password'
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Please Enter Password!'
                    required
                />
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