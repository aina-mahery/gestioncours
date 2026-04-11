export function mockLogin({ email, password, role }) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!email || !password || !role) {
                reject(new Error("Missing credentials"));
                return;
            }

            resolve({
                token: `fake-jwt-${Date.now()}`,
                user: {
                    id: 1,
                    name: email.split("@")[0],
                    email,
                    role
                }
            });
        }, 700);
    });
}