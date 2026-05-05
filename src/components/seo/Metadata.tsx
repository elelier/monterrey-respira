// src/components/seo/Metadata.tsx
import { Helmet } from 'react-helmet-async';

interface MetadataProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: string;
}

export const Metadata = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
}: MetadataProps) => {
  const defaultKeywords = 'calidad del aire, contaminación, Monterrey, ambiente';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta name="twitter:image" content={image} />
        </>
      )}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
