import { MetadataRoute } from 'next';
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://itplatform-three.vercel.app/uk',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://itplatform-three.vercel.app/en',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://itplatform-three.vercel.app/ru',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://itplatform-three.vercel.app/uk/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://itplatform-three.vercel.app/en/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://itplatform-three.vercel.app/ru/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];
}
