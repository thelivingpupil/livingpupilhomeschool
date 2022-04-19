import { useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';
import DatePicker from 'react-datepicker';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';
import { useWorkspace } from '@/providers/workspace';

const steps = [
  'Personal Information',
  'Educational Background',
  'Curriculum',
  'School Fees',
];

const Workspace = () => {
  const { workspace } = useWorkspace();
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState(new Date());

  const goToStep = (step) => setStep(step);

  const next = () => setStep(step + 1);

  const previous = () => setStep(step - 1);

  const renderTab = () => {
    const tabs = [
      renderPersonalInformation,
      renderEducationalBackground,
      renderCurriculum,
      renderSchoolFees,
    ];
    return tabs[step]();
  };

  const renderPersonalInformation = () => {
    return (
      <div className="flex flex-col p-5 space-y-3 overflow-auto">
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Full Name
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              placeholder="Given Name"
            />
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              placeholder="Middle Name"
            />
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Birthday
            </label>
            <div className="relative flex flex-row">
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                selectsStart
                startDate={birthDate}
                nextMonthButtonLabel=">"
                previousMonthButtonLabel="<"
                popperClassName="react-datepicker-left"
              />
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Age
            </label>
            <div className="relative flex flex-row space-x-5">
              <input
                className="w-full px-3 py-2 border rounded"
                disabled
                value={`${
                  differenceInCalendarYears(new Date(), birthDate) || 0
                } years old`}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Gender
            </label>
            <div className="flex flex-row">
              <div className="relative inline-block w-full border rounded">
                <select className="w-full px-3 py-2 capitalize rounded appearance-none">
                  <option>Female</option>
                  <option>Male</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Religion
            </label>
            <input
              className="px-3 py-2 border rounded"
              placeholder="Religion"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Reason for Homeschooling
          </label>
          <div className="relative flex flex-row space-x-5">
            <textarea
              className="w-full px-3 py-2 border rounded"
              placeholder="Why did you choose to homeschool your child?"
              rows={5}
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderEducationalBackground = () => {
    return (
      <div className="flex flex-col p-5 space-y-3 overflow-auto">
        <div className="flex flex-row space-x-5">
          <div className="flex flex-col w-full">
            <label className="text-lg font-bold" htmlFor="txtMother">
              Incoming Grade Level
            </label>
            <div className="flex flex-row">
              <div className="relative inline-block w-full border rounded">
                <select className="w-full px-3 py-2 capitalize rounded appearance-none">
                  <option>Preschool</option>
                  <option>K1</option>
                  <option>K2</option>
                  <option>Grade 1</option>
                  <option>Grade 2</option>
                  <option>Grade 3</option>
                  <option>Grade 4</option>
                  <option>Grade 5</option>
                  <option>Grade 6</option>
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Former School Name
          </label>
          <div className="flex flex-row space-x-5">
            <input
              className="px-3 py-2 border rounded md:w-1/3"
              placeholder="Former School Name"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-bold" htmlFor="txtMother">
            Former School Address
          </label>
          <div className="relative flex flex-row space-x-5">
            <textarea
              className="w-full px-3 py-2 border rounded"
              placeholder="Former School Address"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  const renderCurriculum = () => {
    return (
      <div className="flex flex-col p-5 space-y-3 overflow-auto">
        <div className="flex flex-row space-x-5">
          <div className="relative flex flex-col w-full p-5 space-y-3 border-4 rounded-xl md:w-1/2 border-primary-400">
            <div className="absolute flex items-center justify-center w-10 h-10 text-white rounded-full -right-3 -top-3 bg-primary-400">
              <CheckIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold">Charlotte Mason</h3>
            <p>
              The Charlotte Mason method is a gentle, rich, and well-rounded
              philosophy of education established by British educational
              reformer Charlotte Mason in the twentieth century. The method is
              gaining popularity in the homeschooling world in recent years
              because it offers an educational feast that focuses on educating
              the whole child and not just his mind.
            </p>
          </div>
          <div className="relative flex flex-col w-full p-5 space-y-3 border rounded md:w-1/2">
            <h3 className="text-xl font-bold">Eclectic</h3>
            <p>
              Although we highly recommend the Charlotte Mason method, we
              understand that not all families are able to implement it in their
              specific life season. As such we also allow homeschool families to
              use an eclectic curriculum, wherein they can mix and match
              resources for their children’s education.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSchoolFees = () => {
    return <></>;
  };

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={workspace.name}
          subtitle="This is the student record information"
        />
        <Content.Divider />
        <Content.Container>
          <div className="flex flex-wrap justify-between w-full space-x-5">
            {steps.map((name, index) => (
              <div
                className="flex flex-col items-center justify-center space-y-3 cursor-pointer"
                onClick={() => goToStep(index)}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    step === index
                      ? 'bg-secondary-400'
                      : index < step
                      ? 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                >
                  {index < step ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
          <Card>
            <Card.Body title={steps[step]}>{renderTab()}</Card.Body>
            <Card.Footer>
              {step > 0 ? (
                <Button
                  className="text-white bg-primary-600 hover:bg-primary-500"
                  onClick={previous}
                >
                  Previous
                </Button>
              ) : (
                <span />
              )}
              <Button
                className="text-white bg-primary-600 hover:bg-primary-500"
                onClick={next}
              >
                {step === steps.length - 1 ? 'Proceed' : 'Next'}
              </Button>
            </Card.Footer>
          </Card>
        </Content.Container>
      </AccountLayout>
    )
  );
};

export default Workspace;
