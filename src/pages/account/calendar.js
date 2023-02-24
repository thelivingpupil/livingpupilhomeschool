import Image from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { PortableText } from '@portabletext/react';
import { format } from 'date-fns';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import sanityClient from '@/lib/server/sanity';

const imageBuilder = imageUrlBuilder(sanityClient);

const types = {
  FACETOFACE: 'Face To Face',
  ONLINE: 'Online',
};

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
              <div className="cols-span-auto">
                <Card key={event._id}>
                  <div className="relative inline-block w-full">
                    <Image
                      name={event.title}
                      loading="lazy"
                      width={700}
                      height={475}
                      sizes="100vw"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                    />
                  </div>
                  <div className="flex text-2xl font-bold mt-4">
                    {event.title}
                  </div>
                  <div className="text-sm py-2 space-y-3 justify-center text-gray-600 mt-4">
                    <PortableText value={event.description} />
                  </div>
                  <div className="flex flex-wrap mt-2">
                    {event.types
                      ?.filter((type) => type !== '')
                      ?.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 mb-2 mr-3 text-xs text-gray-600 bg-gray-100 rounded-full"
                        >
                          {types[type]}
                        </span>
                      ))}
                  </div>
                  <div className="flex flex-col mt-2">
                    <div className="flex text-lg font-semibold">
                      Date and Times:
                    </div>
                    {event.dateandtime.map((date, idx) => (
                      <div className="flex text-sm" key={idx}>
                        {format(new Date(date), 'eeee, MMMM dd, yyyy hh:mm aa')}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
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
