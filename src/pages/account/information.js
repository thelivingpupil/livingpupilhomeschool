import { ChevronDownIcon } from '@heroicons/react/outline';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';

const Information = () => {
  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Guardian Information" />
      <Content.Title
        title="Guardian Information"
        subtitle="Provide the information of a parent or guardian responsible for the student's records"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <form>
            <Card.Body
              title="Legal Guardian(s)"
              subtitle="We will need your information for student record coordination"
            >
              <div className="flex flex-col">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Primary Guardian
                </label>
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="Primary Guardian's Full Name"
                  />
                  <input
                    className="px-3 py-2 border rounded md:w-1/4"
                    placeholder="Occupation"
                  />
                  <div className="relative inline-block border rounded md:w-1/4">
                    <select className="w-full px-3 py-2 capitalize rounded appearance-none">
                      <option>Mother</option>
                      <option>Father</option>
                      <option>Legal Guardian</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <input
                  className="px-3 py-2 border rounded"
                  placeholder="Primary Guardian's Facebook Profile Link"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Secondary Guardian
                </label>
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="Secondary Guardian's Full Name"
                  />
                  <input
                    className="px-3 py-2 border rounded md:w-1/4"
                    placeholder="Occupation"
                  />
                  <div className="relative inline-block border rounded md:w-1/4">
                    <select className="w-full px-3 py-2 capitalize rounded appearance-none">
                      <option>Mother</option>
                      <option>Father</option>
                      <option>Legal Guardian</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <input
                  className="px-3 py-2 border rounded"
                  placeholder="Secondary Guardian's Facebook Profile Link"
                />
              </div>
            </Card.Body>
            <Card.Footer>
              <small>
                In line with our <strong>Data Privacy Policy</strong> we are
                collecting this Personally Identifiable Information (PII) for
                record keeping
              </small>
              <Button className="text-white bg-primary-600 hover:bg-primary-600">
                Save Information
              </Button>
            </Card.Footer>
          </form>
        </Card>
        <Card>
          <form>
            <Card.Body
              title="Contact Details"
              subtitle="We will need your information for student record coordination"
            >
              <div className="flex flex-col">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Contact Numbers
                </label>
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="Telephone Number"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Additional Email
                </label>
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="another@email.com"
                  />
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <small>
                In line with our <strong>Data Privacy Policy</strong> we are
                collecting this Personally Identifiable Information (PII) for
                record keeping
              </small>
              <Button className="text-white bg-primary-600 hover:bg-primary-600">
                Save Information
              </Button>
            </Card.Footer>
          </form>
        </Card>
        <Card>
          <form>
            <Card.Body
              title="Home Address"
              subtitle="We will need your information for student record coordination"
            >
              <div className="flex flex-col">
                <label className="text-lg font-bold" htmlFor="txtMother">
                  Complete Address
                </label>
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-3/4"
                    placeholder="House No. St. Name, Village/Subdivision, Brgy."
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-3/4"
                    placeholder="City, Country, ZIP Code"
                  />
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <small>
                In line with our <strong>Data Privacy Policy</strong> we are
                collecting this Personally Identifiable Information (PII) for
                record keeping
              </small>
              <Button className="text-white bg-primary-600 hover:bg-primary-600">
                Save Information
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export default Information;
