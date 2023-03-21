import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const Meta = ({ author, description, keywords, noIndex, title }) => {
  const [url, setUrl] = useState('https://livingpupilhomeschool.com');

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      <title>{title}</title>

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}/images/seo-cover.png`} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${url}/images/seo-cover.png`} />

      {noIndex && <meta name="robots" content="noindex" />}

      <Script strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1339259923286669'); 
          fbq('track', 'PageView');
      `}
      </Script>
    </Head>
  );
};

Meta.defaultProps = {
  author: '',
  description: '',
  keywords: '',
  noIndex: false,
};

export default Meta;
