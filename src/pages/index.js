import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import Script from 'next/script';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import render from '@/lib/client/renderer';
import sanityClient from '@/lib/server/sanity';

const Home = ({ page }) => {
  const router = useRouter();

  if (!page) {
    return <ErrorPage statusCode={404} />;
  }

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      {render(page.content)}
      <div id="fb-root"></div>
      <div id="fb-customer-chat" className="fb-customerchat"></div>
      <Script strategy="lazyOnload">
        {`
          var chatbox = document.getElementById('fb-customer-chat');
          chatbox?.setAttribute("page_id", "174774976550458");
          chatbox?.setAttribute("attribution", "biz_inbox");
          
          window.fbAsyncInit = function() {
            FB.init({
              xfbml            : true,
              version          : 'v13.0'
            });
          };

          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
        `}
      </Script>

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
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const page = await sanityClient.fetch(
    `*[_type == 'pages' && index == true][0]{..., content[]->{...}}`
  );
  return {
    props: { page },
    revalidate: 10,
  };
};

export default Home;
