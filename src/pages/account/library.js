import React, { useMemo, useState } from 'react';
import Content from '@/components/Content/index';
import LibraryItem from '@/components/Library';
import imageUrlBuilder from '@sanity/image-url';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Carousel from 'better-react-carousel';
import Image from 'next/image';
import slugify from 'slugify';

const imageBuilder = imageUrlBuilder(sanityClient);

const Library = ({ books }) => {
  const [search, useSearch] = useState('');

  const searchBooks = useMemo(() => {
    if (!search || search === '') {
      return books;
    }

    return books?.filter((book) =>
      book?.title?.toLowerCase()?.includes(search?.toLowerCase().trim())
    );
  }, [search]);

  const parentBooks = useMemo(
    () => searchBooks?.filter((book) => book.for === 'PARENTS'),
    [searchBooks]
  );

  const studentBooks = useMemo(
    () => searchBooks?.filter((book) => book.for === 'STUDENTS'),
    [searchBooks]
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
        <div className="flex flex-col space-y-10 px-5 py-10 rounded border dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Virtual Library</div>
            <div className="flex flex-end">
              <input
                className="px-3 py-2 border rounded"
                placeholder="Search..."
                value={search}
                onChange={(e) => useSearch(e.target.value)}
              />
            </div>
          </div>
          {books?.length > 0 ? (
            <>
              <div className="flex flex-col space-y-5">
                <div className="text-xl italic">Parents</div>
                {parentBooks?.length > 0 ? (
                  <div>
                    <Carousel cols={3} rows={1} gap={10} loop>
                      {parentBooks?.map((book, idx) => {
                        const imageAsset = imageBuilder.image(
                          book?.cover?.asset
                        );
                        const image = imageAsset?.options?.source
                          ? imageAsset?.url()
                          : null;
                        return (
                          <Carousel.Item key={idx}>
                            <LibraryItem book={book} image={image} />
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
                    <Carousel cols={3} rows={1} gap={10} loop>
                      {studentBooks?.map((book, idx) => {
                        const imageAsset = imageBuilder.image(
                          book?.cover?.asset
                        );
                        const image = imageAsset?.options?.source
                          ? imageAsset?.url()
                          : null;
                        return (
                          <Carousel.Item key={idx}>
                            <LibraryItem book={book} image={image} />
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
    'description': bookDescription,
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
