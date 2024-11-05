import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Use dynamic import for ReactQuill to avoid SSR issues
import Meta from '@/components/Meta';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { GRADE_LEVEL, GRADE_LEVEL_GROUPS, GRADE_LEVEL_FORMS, ACCREDITATION_NEW, PROGRAM } from '@/utils/constants';
import { useStudents } from '@/hooks/data';
import { ChevronDownIcon } from '@heroicons/react/outline';

// Dynamically import ReactQuill to avoid SSR (Server-Side Rendering) issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Filter options
const filterOptions = {
    gradeForms: 'Grade Forms',
    gradeLevels: 'Grade Level',
    gradeGroups: 'Grade Groups',
};

// Email sender options
const emailSenderOptions = [
    { value: 'finance', label: 'Finance' },
    { value: 'admin', label: 'Admin' },
    { value: 'shop', label: 'Shop' },
    { value: 'coo', label: 'COO' },
    { value: 'directress', label: 'Directress' },
    { value: 'cottage', label: 'Cottage Coordinator' },
];

// Constant for singular email
const singularEmailOption = { value: 'single', label: 'Single Email' };

const guardianEmailsTest = [
    {
        "email": "user1@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user2@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user3@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user4@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user5@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user6@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user7@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user8@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user9@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user10@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user11@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user12@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user13@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user14@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user15@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user16@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user17@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user18@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user19@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user20@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user21@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user22@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user23@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user24@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user25@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user26@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user27@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user28@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user29@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user30@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user31@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user32@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user33@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user34@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user35@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user36@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user37@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user38@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user39@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user40@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user41@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user42@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user43@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user44@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user45@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user46@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user47@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user48@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user49@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user50@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user51@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user52@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user53@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user54@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user55@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user56@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user57@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user58@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user59@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user60@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user61@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user62@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user63@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user64@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user65@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user66@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user67@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user68@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user69@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user70@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user71@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user72@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user73@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user74@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user75@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user76@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user77@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user78@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user79@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user80@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user81@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user82@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user83@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user84@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user85@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user86@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user87@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user88@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user89@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user90@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user91@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user92@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user93@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user94@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user95@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user96@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user97@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user98@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user99@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user100@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user101@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user102@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user103@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user104@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user105@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user106@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user107@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user108@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user109@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user110@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user111@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user112@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user113@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user114@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user115@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "marjulmugs@gmail.com",
        "primaryGuardianName": "GuardianTest123"
    },
    {
        "email": "user117@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user118@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user119@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user120@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user121@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user122@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user123@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user124@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user125@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user126@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user127@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user128@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user129@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user130@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user131@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user132@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user133@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user134@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user135@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user136@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user137@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user138@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user139@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user140@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user141@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user142@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user143@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user144@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user145@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user146@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user147@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user148@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user149@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user150@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user151@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user152@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user153@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user154@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user155@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user156@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user157@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user158@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user159@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user160@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user161@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user162@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user163@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user164@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user165@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user166@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user167@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user168@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user169@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user170@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user171@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user172@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user173@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user174@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user175@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user176@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user177@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user178@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user179@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user180@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user181@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user182@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user183@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user184@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user185@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user186@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user187@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user188@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user189@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user190@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user191@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user192@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user193@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user194@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user195@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user196@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user197@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user198@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user199@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user200@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user201@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user202@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user203@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user204@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user205@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user206@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user207@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user208@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user209@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user210@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user211@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user212@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user213@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user214@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user215@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user216@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user217@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user218@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user219@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user220@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user221@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user222@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user223@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user224@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user225@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user226@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user227@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user228@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user229@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user230@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user231@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user232@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user233@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user234@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user235@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user236@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user237@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user238@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user239@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user240@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user241@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user242@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user243@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user244@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user245@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user246@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user247@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user248@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user249@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user250@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user251@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user252@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user253@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user254@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user255@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user256@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user257@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user258@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user259@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user260@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user261@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user262@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user263@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user264@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user265@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user266@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user267@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user268@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user269@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user270@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user271@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user272@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user273@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user274@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user275@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user276@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user277@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user278@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user279@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user280@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user281@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user282@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user283@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user284@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user285@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user286@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user287@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user288@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user289@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user290@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user291@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user292@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user293@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user294@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user295@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user296@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user297@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user298@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user299@example.com",
        "primaryGuardianName": "GuardianTest"
    },
    {
        "email": "user300@example.com",
        "primaryGuardianName": "GuardianTest"
    }
]

const Broadcast = () => {
    const { data: studentsData, isLoading } = useStudents();
    const [filterBy, setFilterBy] = useState('');
    const [filterValues, setFilterValues] = useState([]); // Allow multiple selections for grade levels, grade groups, and forms
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [guardianEmails, setGuardianEmails] = useState([]);
    const [emailContent, setEmailContent] = useState(''); // Rich text editor content
    const [emailSender, setEmailSender] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [program, setProgram] = useState([]); // Updated to be an array
    const [accreditation, setAccreditation] = useState([]); // Updated to be an array
    const [emailSendType, setEmailSendType] = useState('multiple'); // State to determine single or multiple emails
    const [singularEmail, setSingularEmail] = useState(''); // State for singular email input
    const [singularParent, setSingularParent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false); // Track form validity

    // Handle checkbox changes for multiple selections
    const handleCheckboxChange = (e, setStateFunc) => {
        const { value, checked } = e.target;
        if (checked) {
            setStateFunc((prev) => [...prev, value]); // Add selected value
        } else {
            setStateFunc((prev) => prev.filter((v) => v !== value)); // Remove unselected value
        }
    };

    // Handle checkbox change for Program
    const handleCheckboxChangeForProgram = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setProgram((prev) => [...prev, value]); // Add selected program
        } else {
            setProgram((prev) => prev.filter((v) => v !== value)); // Remove unselected program
        }
    };


    // Handle checkbox change for Accreditation
    const handleCheckboxChangeForAccreditation = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setAccreditation((prev) => [...prev, value]); // Add selected accreditation
        } else {
            setAccreditation((prev) => prev.filter((v) => v !== value)); // Remove unselected accreditation
        }
    };


    // Handle radio button change for email sending type
    const handleEmailSendTypeChange = (e) => {
        setEmailSendType(e.target.value);
        setSingularEmail('');
        setSingularParent('');
        setFilterBy(''); // Reset filters when switching types
        setFilterValues([]);
        setProgram('');
        setAccreditation('');
    };

    // Filter students based on selected filters
    useEffect(() => {
        if (studentsData && (filterValues.length > 0 || program.length > 0 || accreditation.length > 0)) {
            let filtered = studentsData.students;

            // Log the initial list of students
            //console.log('Initial students list:', filtered);

            // Common status filter for all cases
            const statusFilter = (student) =>
                student.studentStatus === 'INITIALLY_ENROLLED' || student.studentStatus === 'ENROLLED' || student.studentStatus === 'PENDING';

            if (filterBy === 'gradeLevels') {
                // Filter by Grade Levels
                filtered = filtered.filter((student) =>
                    filterValues.includes(student.incomingGradeLevel) && statusFilter(student)
                );
                //console.log('Filtered by grade levels:', filtered);
            } else if (filterBy === 'gradeGroups') {
                // Filter by Grade Groups
                const selectedGroups = GRADE_LEVEL_GROUPS.filter((g) => filterValues.includes(g.name));
                filtered = filtered.filter((student) =>
                    selectedGroups.some((group) => group.levels.includes(student.incomingGradeLevel)) && statusFilter(student)
                );
                //console.log('Filtered by grade groups:', filtered);
            } else if (filterBy === 'gradeForms') {
                // Filter by Grade Forms
                const selectedForms = filterValues.flatMap((form) => GRADE_LEVEL_FORMS[form]);
                filtered = filtered.filter((student) =>
                    selectedForms.includes(student.incomingGradeLevel) && statusFilter(student)
                );
                //console.log('Filtered by grade forms:', filtered);
            }

            // Apply Program filter (if multiple are selected)
            if (program.length > 0) {
                //console.log('Program selected:', program);
                filtered = filtered.filter((student) => program.includes(student.program));
                //console.log('Filtered by program:', filtered);
            }

            // Apply Accreditation filter (if multiple are selected)
            if (accreditation.length > 0) {
                //console.log('Accreditation selected:', accreditation);
                filtered = filtered.filter((student) => accreditation.includes(student.accreditation));
                //console.log('Filtered by accreditation:', filtered);
            }

            // Log final filtered students
            //console.log('Final filtered students:', filtered);
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(studentsData?.students || []);
            //console.log('No filters applied, showing all students.');
        }
    }, [filterValues, filterBy, program, accreditation, studentsData]);


    // Extract guardian emails after filtering students
    useEffect(() => {
        if (filterValues.length === 0 || filteredStudents.length === 0) {
            setGuardianEmails([]); // Reset guardianEmails if no filters are selected
        } else if (Array.isArray(filteredStudents) && filteredStudents.length > 0) {
            const emailsAndGuardians = filteredStudents
                .map((student) => {
                    const guardianInfo = student.student?.creator;
                    if (guardianInfo) {
                        return {
                            email: guardianInfo?.email,
                            primaryGuardianName: guardianInfo?.guardianInformation.primaryGuardianName,
                        };
                    }
                    return null;
                })
                .filter((info) => info !== null); // Filter out any null results

            // Filter out duplicates based on email
            const uniqueEmailsAndGuardians = Array.from(
                new Set(emailsAndGuardians.map(info => info.email))
            ).map(email => {
                return emailsAndGuardians.find(info => info.email === email);
            });

            setGuardianEmails(uniqueEmailsAndGuardians);
        }
    }, [filteredStudents, filterValues]);

    useEffect(() => {
        // Validate form when any related state changes
        if (emailSendType === 'multiple') {
            // Validate fields for multiple emails
            const isMultipleValid =
                filterValues.length > 0 && guardianEmails.length > 0 && emailSender && emailSubject && emailContent;
            setIsFormValid(isMultipleValid);
        } else if (emailSendType === 'single') {
            // Validate fields for single email
            const isSingleValid =
                singularEmail && singularParent && emailSender && emailSubject && emailContent;
            setIsFormValid(isSingleValid);
        }
    }, [filterValues, emailSender, emailSubject, emailContent, singularEmail, singularParent, emailSendType, guardianEmails]);


    const handleSenderChange = (event) => {
        setEmailSender(event.target.value);
    };

    const handleSendClick = async () => {
        setIsSending(true); // Disable button while sending emails
        try {
            const guardianEmailsToSend = emailSendType === 'single'
                ? [{ email: singularEmail, primaryGuardianName: singularParent }]
                : guardianEmails; // Handle singular email

            // Function to split an array into chunks of a specific size
            const chunkArray = (array, size) => {
                const chunks = [];
                for (let i = 0; i < array.length; i += size) {
                    chunks.push(array.slice(i, i + size));
                }
                return chunks;
            };

            // Function to delay execution for a specified number of milliseconds (1 minute = 60000 ms)
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Chunk the guardian emails into batches of 50
            const batches = chunkArray(guardianEmailsToSend, 50);

            for (const batch of batches) {
                const response = await fetch('/api/broadcast', { // Adjust the API endpoint accordingly
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emailContent,
                        sender: emailSender,
                        subject: emailSubject,
                        guardianEmails: batch, // Send the current batch
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Failed to send emails: ${errorData.errors.error.msg}`);
                    return; // Stop if any batch fails
                }

                await delay(2000);
            }

            alert('Emails sent successfully!');

            // Optionally reset state after sending
            setSingularParent('');
            setSingularEmail('');
            setGuardianEmails([]);
            setEmailContent('');
            setEmailSubject('');
            setEmailSender('');
            setFilterValues([]); // Reset filterValues
            setProgram([]); // Reset program checkboxes
            setAccreditation([]); // Reset accreditation checkboxes

        } catch (error) {
            console.error('Error sending emails:', error);
            alert('An error occurred while sending emails. Please try again.');
        } finally {
            setIsSending(false); // Re-enable button after sending
        }
    };


    const handleContentChange = (content) => {
        setEmailContent(content); // Use Quill content (HTML format)
    };

    const filterValueOptions =
        filterBy === 'gradeLevels'
            ? Object.entries(GRADE_LEVEL).map(([value, label]) => ({ value, label }))
            : filterBy === 'gradeGroups'
                ? GRADE_LEVEL_GROUPS.map((group) => ({ value: group.name, label: group.name }))
                : Object.entries(GRADE_LEVEL_FORMS).map(([form, levels]) => ({ value: form, label: form }));

    if (isLoading) {
        return <div>Loading...</div>; // Loading state when data is being fetched
    }

    const handleFilterByChange = (key) => {
        setFilterBy(key);
        setFilterValues([]); // Reset filterValues when the filter option changes
        setGuardianEmails([]);
    };

    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Broadcast Email" />
            <Content.Title title="Broadcast Email" subtitle="Send email to parents" />
            <Card>
                <Card.Body title="Compose Email">
                    {/* Radio Buttons for Single/Multiple Email */}
                    <div className="mb-4">
                        <label className="text-lg font-bold mr-5">Send To:</label>
                        <div className="flex space-x-4">
                            <label>
                                <input
                                    type="radio"
                                    value="multiple"
                                    checked={emailSendType === 'multiple'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Multiple Emails</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="single"
                                    checked={emailSendType === 'single'}
                                    onChange={handleEmailSendTypeChange}
                                />
                                <span className="ml-2">Single Email</span>
                            </label>
                        </div>
                    </div>

                    {/* Show either filters or single email input based on the selection */}
                    {emailSendType === 'multiple' ? (
                        <div>
                            {/* Filter and Sender Section */}
                            <div className="flex flex-col">
                                <div className="flex flex-col w-full md:w-1/2 space-y-2">
                                    <div className="text-lg font-bold">Filter By:</div>
                                    <div className="flex flex-wrap space-x-4">
                                        {Object.entries(filterOptions).map(([key, label]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleFilterByChange(key)} // Use handleFilterByChange to reset filterValues
                                                className={`p-2 border rounded ${filterBy === key ? 'bg-blue-500 text-white' : 'bg-white'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Display checkboxes for the selected filter */}
                                {filterBy && (
                                    <div className="mt-2">
                                        {filterValueOptions.map(({ value, label }) => (
                                            <label key={value} className="block">
                                                <input
                                                    type="checkbox"
                                                    value={value}
                                                    onChange={e => handleCheckboxChange(e, setFilterValues)}
                                                />
                                                <span className="ml-2">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Program Checkbox */}
                            <div className="mt-2">
                                {/* Display checkboxes for program selection */}
                                <div className="text-lg font-bold">Program:</div>
                                {Object.entries(PROGRAM).map(([value, label]) => (
                                    <label key={value} className="block">
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={(e) => handleCheckboxChange(e, setProgram)} // Use checkbox change handler
                                        />
                                        <span className="ml-2">{label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Accreditation Checkbox */}
                            <div className="mt-2">
                                {/* Display checkboxes for accreditation selection */}
                                <div className="text-lg font-bold">Accreditation:</div>
                                {Object.entries(ACCREDITATION_NEW).map(([value, label]) => (
                                    <label key={value} className="block">
                                        <input
                                            type="checkbox"
                                            value={value}
                                            onChange={(e) => handleCheckboxChange(e, setAccreditation)} // Use checkbox change handler
                                        />
                                        <span className="ml-2">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 flex flex-col">
                                {/* Input field for single email */}
                                <label className="text-lg font-bold">Parent's Email:</label>
                                <input
                                    type="email"
                                    value={singularEmail}
                                    onChange={(e) => setSingularEmail(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${singularEmail.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's email"
                                />
                            </div>
                            <div className="mt-4 flex flex-col">
                                {/* Input field for single email */}
                                <label className="text-lg font-bold">Parent's Name:</label>
                                <input
                                    type="email"
                                    value={singularParent}
                                    onChange={(e) => setSingularParent(e.target.value)}
                                    className={` p-2 border rounded w-full md:w-1/2 ${singularParent.length <= 0 ? 'border-red-500 border-2 rounded' : 'border'}`}
                                    placeholder="Enter parent's name"
                                />
                            </div>
                        </>
                    )}

                    {/* Email Sender Dropdown */}
                    <div className="flex flex-col w-full md:w-1/2 space-y-2 mt-5">
                        <div className="text-lg font-bold">Sender:</div>
                        <div
                            className={`relative inline-block w-full ${emailSender.length <= 0 ? 'border-red-500 border-2 rounded' : 'border-none'}`}
                        >
                            <select
                                className="w-full px-3 py-2 appearance-none rounded border"
                                onChange={handleSenderChange}
                                value={emailSender}
                            >
                                <option value="">Select Sender</option>
                                {emailSenderOptions.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Subject Section */}
                    <div className="flex flex-col">
                        <label className="text-lg font-bold mr-5" htmlFor="txtMother">
                            Subject:
                        </label>
                        <input
                            className={`px-3 py-2 rounded md:w-1/2 ${emailSubject.length <= 0 ? 'border-red-500 border-2' : 'border'
                                }`}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            value={emailSubject}
                        />
                    </div>

                    <div className="mt-4" style={{ minHeight: '260px', height: 'auto' }}>
                        <label className="text-lg font-bold mr-5" htmlFor="txtMother">
                            Content:
                        </label>
                        <ReactQuill
                            value={emailContent}
                            onChange={handleContentChange}
                            style={{ height: '90%', resize: 'vertical' }} // Ensure the editor fills the parent div
                        />
                    </div>

                    {/* Send Email Button */}
                    <div className="flex justify-center mt-4"> {/* Added mt-4 for margin-top */}
                        <button
                            onClick={handleSendClick}
                            disabled={!isFormValid || isSending}
                            className={`w-1/4 mt-10 py-3 px-4 rounded-md text-white font-bold ${isSending || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {isSending ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>

                </Card.Body>
            </Card>
        </AdminLayout>
    );
};

export default Broadcast;
