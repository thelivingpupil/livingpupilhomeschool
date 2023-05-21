import React, { useMemo } from 'react';
import Content from '@/components/Content/index';
import imageUrlBuilder from '@sanity/image-url';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Carousel from 'better-react-carousel';
import Image from 'next/image';
import slugify from 'slugify';

const imageBuilder = imageUrlBuilder(sanityClient);

const Library = ({ books }) => {
  console.log('books', books);

  const parentBooks = useMemo(
    () => books?.filter((book) => book.for === 'PARENTS'),
    [books]
  );

  const studentBooks = useMemo(
    () => books?.filter((book) => book.for === 'STUDENTS'),
    [books]
  );
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Virtual Library" />
      <Content.Title
        title="Parent and Student Virtual Library"
        subtitle="View and download books dedicated for both parents and students"
      />
      <Content.Divider />
      <Content.Container>
        <div className="flex flex-col space-y-10 px-5 py-10 rounded border border-gray-500">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Virtual Library</div>
            <div className="flex flex-end">
              <input
                className="px-3 py-2 border rounded"
                placeholder="Search..."
              />
            </div>
          </div>
          {books?.length > 0 ? (
            <>
              <div className="flex flex-col space-y-5">
                <div className="text-xl italic">Parents</div>
                {parentBooks?.length > 0 ? (
                  <div>
                    <Carousel cols={5} rows={1} gap={10} loop>
                      {parentBooks?.map((book, idx) => {
                        const imageAsset = imageBuilder.image(
                          book?.cover?.asset
                        );
                        const image = imageAsset?.options?.source
                          ? imageAsset?.url()
                          : null;
                        return (
                          <Carousel.Item key={idx}>
                            <div className="flex flex-col justify-center items-center space-y-3 p-2">
                              <div>
                                <Image
                                  alt={slugify(book?.title?.toLowerCase())}
                                  src={
                                    image ||
                                    '/images/livingpupil-homeschool-logo.png'
                                  }
                                  width={150}
                                  height={250}
                                />
                              </div>
                              <a
                                className="flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-2/3 text-sm cursor-pointer hover:bg-primary-500"
                                href={`${book?.file}?dl=${slugify(
                                  book?.title?.toLowerCase()
                                )}.pdf`}
                              >
                                Download
                              </a>
                            </div>
                          </Carousel.Item>
                        );
                      })}
                    </Carousel>
                  </div>
                ) : (
                  <div className="text=3xl italic">
                    No available books for parents...
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-5">
                <div className="text-xl italic">Students</div>
                {studentBooks?.length > 0 ? (
                  <div>
                    <Carousel cols={5} rows={1} gap={10} loop>
                      {studentBooks?.map((book, idx) => {
                        const imageAsset = imageBuilder.image(
                          book?.cover?.asset
                        );
                        const image = imageAsset?.options?.source
                          ? imageAsset?.url()
                          : null;
                        return (
                          <Carousel.Item key={idx}>
                            <div className="flex flex-col justify-center items-center space-y-3 p-2">
                              <div>
                                <Image
                                  alt={slugify(book?.title?.toLowerCase())}
                                  src={
                                    image ||
                                    '/images/livingpupil-homeschool-logo.png'
                                  }
                                  width={150}
                                  height={250}
                                />
                              </div>
                              <a
                                className="flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-2/3 text-sm cursor-pointer hover:bg-primary-500"
                                href={`${book?.file}?dl=${slugify(
                                  book?.title?.toLowerCase()
                                )}.pdf`}
                              >
                                Download
                              </a>
                            </div>
                          </Carousel.Item>
                        );
                      })}
                    </Carousel>
                  </div>
                ) : (
                  <div className="text=3xl italic">
                    No available books for students...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text=3xl italic">No available books...</div>
          )}
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const books = await sanityClient.fetch(`*[_type == 'books']{
    'title': bookTitle,
    'for': bookFor,
    'cover': bookCover,
    'file': bookFile.asset->url
  }`);

  return {
    props: {
      books,
    },
  };
};

export default Library;
