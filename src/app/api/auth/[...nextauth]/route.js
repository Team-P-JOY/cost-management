import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeQuery } from "@/lib/oracle";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        // password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(process.env.AUTH_API, {
            method: "POST",
            body: JSON.stringify({
              username: credentials.username,
              // password: credentials.password,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const userAuth = await response.json();
          if (userAuth.status !== "success") {
            console.log(" Auth failed response:", userAuth);
            return null;
          }

          let userInfo = userAuth.data;

          const user = await executeQuery(
            `SELECT U.USER_ID
              ,U.ROLE
              ,R.ROLE_NAME
              ,R.ROLE_ACCESS
              ,U.LABGROUP_ID
              ,LG.LABGROUP_NAME
            FROM CST_USER U
            INNER JOIN CST_ROLE R 
              ON U.ROLE = R.ROLE_ID
            LEFT JOIN CST_LABGROUP LG 
              ON U.LABGROUP_ID = LG.LABGROUP_ID
            WHERE U.PERSON_ID = :id 
              AND U.FLAG_DEL = 0
              AND U.STATUS_ID = 1`,
            { id: parseInt(userAuth.data.person_id) }
          );

          if (user.length === 0) {
            return null;
          }

          userInfo.labgroupId = user[0].labgroupId;
          userInfo.labgroupName = user[0].labgroupName;

          return {
            id: user[0].id,
            avatar: userAuth.data.avatar,
            person_id: userAuth.data.person_id,
            name: userAuth.data.fullname_th,
            username: credentials.username,
            userInfo: userInfo,
            userRole: user[0].roleName,
            userAccess: JSON.parse(user[0].roleAccess),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.avatar = user.avatar;
        token.person_id = user.person_id;
        token.username = user.username;
        token.userInfo = user.userInfo;
        token.userRole = user.userRole;
        token.userAccess = user.userAccess;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.avatar = token.avatar;
      session.user.person_id = token.person_id;
      session.user.username = token.username;
      session.user.userInfo = token.userInfo;
      session.user.userRole = token.userRole;
      session.user.userAccess = token.userAccess;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
