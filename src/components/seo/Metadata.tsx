// src/components/seo/Metadata.tsx
import { Helmet } from 'react-helmet-async';

interface MetadataProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: string;
}

export const Metadata: React.FC<MetadataProps> = ({
  title,
  description,
  keywords,
  image,
  type = 'website'
}) => {
  const defaultImage = '/images/seo/share-image.png';
  const defaultKeywords = 'calidad del aire, contaminación, Monterrey, ambiente';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};