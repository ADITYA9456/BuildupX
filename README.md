# BildupX Fitness Website

A modern fitness website with calorie tracking functionality built with Next.js, MongoDB, and Tailwind CSS.

## Deployment on Vercel

This project is configured for seamless deployment on Vercel.

### Prerequisites

1. A Vercel account (create one at [vercel.com](https://vercel.com))
2. Your GitHub repository connected to Vercel
3. MongoDB Atlas account with database setup

### Environment Variables

The following environment variables **must** be set in the Vercel dashboard:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your secret key for signing JWT tokens (make it long and random)
- `KEY_ID`: Your Razorpay Key ID
- `KEY_SECRET`: Your Razorpay Secret Key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your public Razorpay Key ID

For local development, place these variables in your `.env.local` file.

### Deployment Steps

1. Push your code to GitHub
2. Login to Vercel and create a new project
3. Connect your GitHub repository
4. Add the environment variables mentioned above
5. Deploy!

### Troubleshooting

If you encounter authentication issues:

1. Make sure your MongoDB URI is correct and the IP is whitelisted in MongoDB Atlas
2. Check that your JWT_SECRET is properly set in Vercel
3. For local development, set the proper values in your `.env` file
4. Clear browser cookies if you experience persistent login issues

## Local Development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
