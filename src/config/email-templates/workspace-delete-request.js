const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const html = ({
  workspaceId,
  workspaceName,
  workspaceSlug,
  studentName,
  gradeLevel,
  schoolYear,
  requesterEmail,
  requesterUserId,
  requestedAt,
}) => {
  const safe = {
    workspaceId: escapeHtml(workspaceId),
    workspaceName: escapeHtml(workspaceName),
    workspaceSlug: escapeHtml(workspaceSlug),
    studentName: escapeHtml(studentName),
    gradeLevel: escapeHtml(gradeLevel),
    schoolYear: escapeHtml(schoolYear),
    requesterEmail: escapeHtml(requesterEmail),
    requesterUserId: escapeHtml(requesterUserId),
    requestedAt: escapeHtml(requestedAt),
  };

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Record Deletion Request</title>
    <style>
      body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 24px; }
      .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
      .muted { color: #6b7280; font-size: 12px; }
      h1 { font-size: 18px; margin: 0 0 12px 0; }
      ul { margin: 8px 0 0 0; padding-left: 18px; }
      li { margin: 6px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Student Record Deletion Request</h1>
      <p>A parent has requested deletion from the Parent Portal (Advanced Settings). No records have been deleted by the system.</p>

      <div class="box">
        <ul>
          <li><strong>Student Name:</strong> ${safe.studentName}</li>
          <li><strong>Grade Level:</strong> ${safe.gradeLevel}</li>
          <li><strong>School Year:</strong> ${safe.schoolYear}</li>
          <li><strong>Workspace ID:</strong> ${safe.workspaceId}</li>
          <li><strong>Workspace Name:</strong> ${safe.workspaceName}</li>
          <li><strong>Workspace Slug:</strong> ${safe.workspaceSlug}</li>
          <li><strong>Requester Email:</strong> ${safe.requesterEmail}</li>
          <li><strong>Requester User ID:</strong> ${safe.requesterUserId}</li>
          <li><strong>Requested At:</strong> ${safe.requestedAt}</li>
        </ul>
      </div>

      <p class="muted">If deletion is approved, an admin can perform the actual deletion from the admin tools.</p>
    </div>
  </body>
</html>
`;
};

const text = ({
  workspaceId,
  workspaceName,
  workspaceSlug,
  studentName,
  gradeLevel,
  schoolYear,
  requesterEmail,
  requesterUserId,
  requestedAt,
}) => {
  return `Hello Admin,

A parent requested student record deletion from the Parent Portal (Advanced Settings).
No records have been deleted by the system.

- Student Name: ${studentName}
- Grade Level: ${gradeLevel}
- School Year: ${schoolYear}
- Workspace ID: ${workspaceId}
- Workspace Name: ${workspaceName}
- Workspace Slug: ${workspaceSlug}
- Requester Email: ${requesterEmail}
- Requester User ID: ${requesterUserId}
- Requested At: ${requestedAt}

If approved, an admin can perform the actual deletion from the admin tools.
`;
};

export { html, text };
