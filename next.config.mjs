/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
  images: {
    domains: [
      'flomsw8jznofd3rz.public.blob.vercel-storage.com',
    ],
  },
};

export default nextConfig;
