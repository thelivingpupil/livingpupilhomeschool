import Image from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { PortableText } from '@portabletext/react';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import sanityClient from '@/lib/server/sanity';

const imageBuilder = imageUrlBuilder(sanityClient);

const Calendar = ({ events }) => {
  console.log('events', events);
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - School Calendar" />
      <Content.Title
        title="Calendar of Events"
        subtitle="View your school calendar of events"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-2 grid-flow-dense gap-4">
          {events.map((event) => {
            const imageAsset = imageBuilder.image(event?.poster?.asset);

            const image = imageAsset?.options?.source
              ? imageAsset?.url()
              : null;

            return (
              <Card key={event._id}>
                <div className="relative inline-block w-full">
                  <Image
                    name={event.title}
                    layout="fill"
                    loading="lazy"
                    objectFit="contain"
                    src={image || '/images/livingpupil-homeschool-logo.png'}
                  />
                </div>
                <div className="flex text-lg">{event.title}</div>
                <div className="text-sm py-2 space-y-3 justify-center">
                  <PortableText value={event.description} />
                </div>
              </Card>
            );
          })}
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const events = await sanityClient.fetch(`*[_type == 'events']`);

  return {
    props: {
      events,
    },
  };
};

export default Calendar;
