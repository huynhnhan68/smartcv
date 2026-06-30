import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import axios from 'axios'

// SmartCV: OAuth config cho Google sign-in qua Cognito Hosted UI.
// redirectSignIn / redirectSignOut nhận nhiều URLs — Amplify tự chọn
// URL khớp với window.location.origin tại runtime.
// Hoạt động trên: localhost (dev), GitHub Pages, CloudFront (sau khi verify).
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: 'smartcv-auth.auth.ap-southeast-1.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [
            'http://localhost:5173/auth/callback',
            'http://localhost:5174/auth/callback',
            'https://huynhnhan68.github.io/smartcv/auth/callback',
          ],
          redirectSignOut: [
            'http://localhost:5173/',
            'http://localhost:5174/',
            'https://huynhnhan68.github.io/smartcv/',
          ],
          responseType: 'code',
        },
      },
    },
  },
})


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach Cognito JWT to every request
api.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (token) config.headers.Authorization = token
  return config
})
