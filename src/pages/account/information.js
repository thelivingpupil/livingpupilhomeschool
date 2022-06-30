import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { GuardianType } from '@prisma/client';
import { getSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { getGuardianInformation } from '@/prisma/services/user';

const Information = ({ guardian }) => {
  const [isSubmitting, setSubmittingState] = useState(false);
  const [primaryGuardianName, setPrimaryGuardianName] = useState(
    guardian?.primaryGuardianName || ''
  );
  const [primaryGuardianOccupation, setPrimaryGuardianOccupation] = useState(
    guardian?.primaryGuardianOccupation || ''
  );
  const [primaryGuardianType, setPrimaryGuardianType] = useState(
    guardian?.primaryGuardianType || GuardianType.MOTHER
  );
  const [primaryGuardianProfile, setPrimaryGuardianProfile] = useState(
    guardian?.primaryGuardianProfile || ''
  );
  const [secondaryGuardianName, setSecondaryGuardianName] = useState(
    guardian?.secondaryGuardianName || ''
  );
  const [secondaryGuardianOccupation, setSecondaryGuardianOccupation] =
    useState(guardian?.secondaryGuardianOccupation || '');
  const [secondaryGuardianType, setSecondaryGuardianType] = useState(
    guardian?.secondaryGuardianType || GuardianType.MOTHER
  );
  const [secondaryGuardianProfile, setSecondaryGuardianProfile] = useState(
    guardian?.secondaryGuardianProfile || ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    guardian?.mobileNumber || ''
  );
  const [telephoneNumber, setTelephoneNumber] = useState(
    guardian?.telephoneNumber || ''
  );
  const [anotherEmail, setAnotherEmail] = useState(
    guardian?.anotherEmail || ''
  );
  const [address1, setAddress1] = useState(guardian?.address1 || '');
  const [address2, setAddress2] = useState(guardian?.address2 || '');

  const handlePrimaryGuardianName = (event) =>
    setPrimaryGuardianName(event.target.value);
  const handlePrimaryGuardianOccupation = (event) =>
    setPrimaryGuardianOccupation(event.target.value);
  const handlePrimaryGuardianType = (event) =>
    setPrimaryGuardianType(event.target.value);
  const handlePrimaryGuardianProfile = (event) =>
    setPrimaryGuardianProfile(event.target.value);
  const handleSecondaryGuardianName = (event) =>
    setSecondaryGuardianName(event.target.value);
  const handleSecondaryGuardianOccupation = (event) =>
    setSecondaryGuardianOccupation(event.target.value);
  const handleSecondaryGuardianType = (event) =>
    setSecondaryGuardianType(event.target.value);
  const handleSecondaryGuardianProfile = (event) =>
    setSecondaryGuardianProfile(event.target.value);
  const handleMobileNumber = (event) => setMobileNumber(event.target.value);
  const handleTelephoneNumber = (event) =>
    setTelephoneNumber(event.target.value);
  const handleAnotherEmail = (event) => setAnotherEmail(event.target.value);
  const handleAddress1 = (event) => setAddress1(event.target.value);
  const handleAddress2 = (event) => setAddress2(event.target.value);

  const saveGuardianInformation = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api('/api/user/guardian', {
      body: {
        primaryGuardianName,
        primaryGuardianOccupation,
        primaryGuardianType,
        primaryGuardianProfile,
        secondaryGuardianName,
        secondaryGuardianOccupation,
        secondaryGuardianType,
        secondaryGuardianProfile,
        mobileNumber,
        telephoneNumber,
        anotherEmail,
        address1,
        address2,
      },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Guardian Information saved!');
      }
    });
  };

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Guardian Information" />
      <Content.Title
        title="Guardian Information"
        subtitle="Provide the information of a parent or guardian responsible for the student's records"
      />
      <Content.Divider />
      <div className="px-3 py-3 text-sm text-blue-500 border-2 border-blue-600 rounded bg-blue-50">
        <p>
          Complete this <strong>Guardian Information</strong> form
        </p>
      </div>
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
                    onChange={handlePrimaryGuardianName}
                    value={primaryGuardianName}
                  />
                  <input
                    className="px-3 py-2 border rounded md:w-1/4"
                    placeholder="Occupation"
                    onChange={handlePrimaryGuardianOccupation}
                    value={primaryGuardianOccupation}
                  />
                  <div className="relative inline-block border rounded md:w-1/4">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={handlePrimaryGuardianType}
                      value={primaryGuardianType}
                    >
                      {Object.keys(GuardianType).map((key, index) => (
                        <option key={index} value={GuardianType[`${key}`]}>
                          {GuardianType[`${key}`]
                            .replace('_', ' ')
                            .toLowerCase()}
                        </option>
                      ))}
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
                  onChange={handlePrimaryGuardianProfile}
                  value={primaryGuardianProfile}
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
                    onChange={handleSecondaryGuardianName}
                    value={secondaryGuardianName}
                  />
                  <input
                    className="px-3 py-2 border rounded md:w-1/4"
                    placeholder="Occupation"
                    onChange={handleSecondaryGuardianOccupation}
                    value={secondaryGuardianOccupation}
                  />
                  <div className="relative inline-block border rounded md:w-1/4">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={handleSecondaryGuardianType}
                      value={secondaryGuardianType}
                    >
                      {Object.keys(GuardianType).map((key, index) => (
                        <option key={index} value={GuardianType[`${key}`]}>
                          {GuardianType[`${key}`]
                            .replace('_', ' ')
                            .toLowerCase()}
                        </option>
                      ))}
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
                  onChange={handleSecondaryGuardianProfile}
                  value={secondaryGuardianProfile}
                />
              </div>
            </Card.Body>
            <Card.Footer>
              <small>
                In line with our <strong>Data Privacy Policy</strong> we are
                collecting this Personally Identifiable Information (PII) for
                record keeping
              </small>
              <Button
                className="text-white bg-primary-600 hover:bg-primary-600"
                disabled={isSubmitting}
                onClick={saveGuardianInformation}
              >
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
                    onChange={handleMobileNumber}
                    value={mobileNumber}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-1/2"
                    placeholder="Telephone Number"
                    onChange={handleTelephoneNumber}
                    value={telephoneNumber}
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
                    onChange={handleAnotherEmail}
                    value={anotherEmail}
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
              <Button
                className="text-white bg-primary-600 hover:bg-primary-600"
                disabled={isSubmitting}
                onClick={saveGuardianInformation}
              >
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
                    onChange={handleAddress1}
                    value={address1}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row space-x-5">
                  <input
                    className="px-3 py-2 border rounded md:w-3/4"
                    placeholder="City, Country, ZIP Code"
                    onChange={handleAddress2}
                    value={address2}
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
              <Button
                className="text-white bg-primary-600 hover:bg-primary-600"
                disabled={isSubmitting}
                onClick={saveGuardianInformation}
              >
                Save Information
              </Button>
            </Card.Footer>
          </form>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  const guardian = await getGuardianInformation(session.user?.userId);
  return { props: { guardian } };
};

export default Information;
