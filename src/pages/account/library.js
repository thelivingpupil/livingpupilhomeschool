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
  const book = books && books[0];
  const imageAsset = imageBuilder.image(book?.cover?.asset);
  const image = imageAsset?.options?.source ? imageAsset?.url() : null;
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Virtual Library" />
      <Content.Title
        title="Parent and Student Virtual Library"
        subtitle="View and download books dedicated for both parents and students"
      />
      <Content.Divider />
      <Content.Container>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div>Virtual Library</div>
            <div className="flex flex-end">
              <div>options</div>
              <div>search</div>
            </div>
          </div>
          {books?.length > 0 && (
            <div className="flex flex-col">
              <div>Parents</div>
              <div>
                <Carousel cols={5} rows={1} gap={5} loop>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                  <Carousel.Item>
                    <Image
                      alt={slugify(book?.title)}
                      src={image || '/images/livingpupil-homeschool-logo.png'}
                      width={150}
                      height={250}
                    />
                  </Carousel.Item>
                </Carousel>
              </div>
            </div>
          )}
          <div>Students</div>
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
