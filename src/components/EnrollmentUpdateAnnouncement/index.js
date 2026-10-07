import { useRef, useState } from 'react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';

const EnrollmentUpdateAnnouncement = ({ onResolved }) => {
  const [open, setOpen] = useState(true);
  const resolvedRef = useRef(false);
  const onResolvedRef = useRef(onResolved);

  onResolvedRef.current = onResolved;

  const dismiss = () => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      onResolvedRef.current?.();
    }

    setOpen(false);
  };

  return (
    <Modal show={open} title="📢 ENROLLMENT UPDATE" toggle={dismiss}>
      <div className="max-w-xl space-y-4 text-sm leading-6 text-gray-700">
        <p>
          We would like to inform our families and interested applicants that
          enrollment for Local Accreditation for Grades 1–12 is now CLOSED.
        </p>
        <p>However, enrollment is still OPEN for the following programs:</p>
        <ul className="pl-5 space-y-1 list-disc">
          <li>Preschool</li>
          <li>Kindergarten 1 (K1)</li>
          <li>International Accreditation – All Grade Levels</li>
        </ul>
        <p>
          If you are interested in enrolling under any of the programs with
          open slots, we encourage you to complete your enrollment requirements
          as soon as possible.
        </p>
        <p>
          Thank you for choosing Living Pupil Homeschool as your partner in
          your child’s homeschooling journey. 💛
        </p>
        <div className="flex justify-end pt-2">
          <Button
            className="text-white bg-primary-600 hover:bg-primary-500"
            onClick={dismiss}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EnrollmentUpdateAnnouncement;
