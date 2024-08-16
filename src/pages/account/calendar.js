import { useState } from 'react';
import Image from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { PortableText } from '@portabletext/react';
import { format } from 'date-fns';

import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import sanityClient from '@/lib/server/sanity';
import ImageModal from '@/components/Modal/Image-Modal';

const imageBuilder = imageUrlBuilder(sanityClient);

const types = {
  FACETOFACE: 'Face To Face',
  ONLINE: 'Online',
};

const Calendar = ({ events }) => {
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  console.log(events)

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  const handleToggleAdditionalInfo = (eventId) => {
    setExpandedEventId(eventId === expandedEventId ? null : eventId);
  };

  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleImageHover = (event, imageId) => {
    const { clientX, clientY } = event;
    setTooltipPosition({ x: clientX, y: clientY, imageId });
  };

  const handleImageLeave = () => {
    setTooltipPosition({ x: 0, y: 0, imageId: null });
  };

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - School Calendar" />
      <Content.Title
        title="Calendar of Events"
        subtitle="View your school calendar of events"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-dense gap-4">
          {events.map((event) => {
            const imageAsset = imageBuilder.image(event?.poster?.asset);

            const image = imageAsset?.options?.source
              ? imageAsset?.url()
              : null;

            return (
              <div className="cols-span-auto">
                <Card key={event._id}>
                  <div
                    className="relative inline-block w-full cursor-pointer"
                    onClick={() => handleImageClick(image)}
                    onMouseEnter={(e) => handleImageHover(e, event._id)}
                    onMouseLeave={handleImageLeave}
                  >
                    <Image
                      name={event.title}
                      loading="lazy"
                      width={700}
                      height={475}
                      sizes="100vw"
                      objectFit="contain"
                      className="transition-transform transform hover:scale-105 hover:shadow-md"
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                    />
                    {tooltipPosition.imageId === event._id && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-8 bg-gray-800 text-white px-2 py-1 rounded-md text-xs">
                        Click to zoom
                      </div>
                    )}
                  </div>

                  <div className="flex text-xl font-bold mt-4">
                    {event.title}
                  </div>
                  <div className="text-sm py-2 space-y-3 justify-center text-gray-600 mt-2 text-justify">
                    <PortableText value={event.description} />
                  </div>
                  {/* Button to toggle additional info */}
                  <button
                    className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 mt-1 mb-4"
                    onClick={() => handleToggleAdditionalInfo(event._id)}
                  >
                    {expandedEventId === event._id ? 'Click To Hide Event Details' : 'Click To Show Event Details'}
                  </button>
                  {expandedEventId === event._id && (
                    <>

                      <div className="flex flex-wrap">
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
                      <div className="flex flex-col mt-4">
                        <div className="flex font-semibold">Date and Times:</div>
                        <div className="flex flex-wrap">
                          {event.dateandtime.map((date, idx) => (
                            <div
                              className="flex text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 mb-2 mr-3"
                              key={idx}
                            >
                              {format(
                                new Date(date),
                                'eeee, MMMM dd, yyyy hh:mm aa'
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col mt-4">
                        <div className="flex font-semibold">Who can join?</div>
                        <div className="flex flex-col">
                          {event.joiners
                            ?.filter((joiner) => joiner !== '')
                            ?.map((joiner, idx) => (
                              <div
                                className="flex text-sm text-gray-600 bg-gray-100 px-3 py-1 mb-2 mr-3"
                                key={idx}
                              >
                                {joiner}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="flex flex-col mt-4">
                        <div className="flex font-semibold">Registration Link</div>
                        <div className="flex flex-col mt-2">
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm break-words"
                          >
                            {event.link}
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col mt-4">
                        <div className="flex font-semibold">Event File</div>
                        <div className="flex flex-col mt-2">
                          {event.eventFile?.url ? (
                            <a
                              href={event.eventFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm break-words bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 text-center inline-block"
                            >
                              Download File
                            </a>
                          ) : (
                            <span className="text-sm break-words bg-gray-100 text-gray-600 py-2 px-4 rounded-full">
                              No file available
                            </span>
                          )}
                        </div>
                      </div>


                      <div className="flex flex-col mt-4">
                        <div className="flex font-semibold">Venue</div>
                        <div className="flex flex-col mt-2">
                          <a
                            href={event.maplink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm break-words"
                          >
                            {event.maplink}
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                </Card>
              </div>
            );
          })}
        </div>
      </Content.Container>
      {/* Expanded image modal */}
      {expandedImage && (
        <ImageModal imageUrl={expandedImage} onClose={handleCloseExpandedImage} className />
      )}
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const events = await sanityClient.fetch(`*[_type == 'events']{
    _id,
    title,
    dateandtime,
    description,
    joiners,
    poster,
    types,
    eventFile {
      'url': asset->url
    },
    link,
    maplink,
    _createdAt,
    _updatedAt
  }`);

  return {
    props: {
      events,
    },
  };
};


export default Calendar;
