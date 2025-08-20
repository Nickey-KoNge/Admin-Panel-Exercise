//pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth ({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password"},

            },
            async authorize (credentials, req) {
                if(!credentials) return null;

                const response = await fetch('https://api.npoint.io/6a59db5e14693c0bd32b');
                const staffList = await response.json();
                const user = staffList.find((staff: any) => staff.email === credentials.email);
                if(user && user.password === credentials.password) {
                    return { id: user.id, email: user.email, name: user.name , role_id: user.role_id};
                }else {
                    return null;
                }
            }
        })
    ],
    callbacks: {
      
        async jwt({ token, user }) {
          
            if (user) {
                token.role_id = user.role_id;
            }
            return token;
        },
        
        async session({ session, token }) {
            
            if (session.user) {
                session.user.role_id = token.role_id;
            }
            return session;
        }
    },

    pages: {
        signIn: '/admin/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
 
    session: {
        strategy: "jwt",
    },
    
})