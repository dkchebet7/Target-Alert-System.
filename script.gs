/**
 * Target Alert System
 * 
 * Sends automated email reminders to relevant stakeholders (Associates, TLs, PMs)
 * based on missing productivity target data pulled from BigQuery.
 * 
 * Email Schedule:
 * - Monday: Summary of previous week's data (Mon–Sun)
 * - Wednesday: Summary of current week (Mon–Tue)
 * - Friday: Summary of current week (Mon–Thu) or monthly summary if last Friday
 */

function sendEmailsForProductivityTargets() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let startDate, endDate, emailType;

  if (dayOfWeek === 1) {
    // Monday: Previous week's data
    startDate = getPreviousMonday(today);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    emailType = "Weekly Summary (Previous Week)";
  } else if (dayOfWeek === 3) {
    // Wednesday: Monday–Tuesday
    startDate = getCurrentMonday(today);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    emailType = "Midweek Summary (Monday–Tuesday)";
  } else if (dayOfWeek === 5) {
    if (isLastFridayOfMonth(today)) {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      emailType = "Monthly Summary";
    } else {
      startDate = getCurrentMonday(today);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 3);
      emailType = "End of Week Summary (Monday–Thursday)";
    }
  } else {
    Logger.log("Script does not run on this day.");
    return;
  }

  const startDateStr = Utilities.formatDate(startDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const endDateStr = Utilities.formatDate(endDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

  // 🔒 Sanitized BQ Project and Table
  const query = `
    SELECT
      Manager_Name,
      Manager_Email,
      STRING_AGG(CAST(Date AS STRING), ', ') AS Dates,
      Workflow_Name,
      Step_Type
    FROM my_project.analytics_dataset.missing_targets_view
    WHERE Date >= '${startDateStr}'
      AND Date <= '${endDateStr}'
      AND Productivity_Target IS NULL
    GROUP BY Manager_Name, Manager_Email, Workflow_Name, Step_Type
  `;

  const request = { query: query, useLegacySql: false };
  const results = BigQuery.Jobs.query(request, 'my_project');

  if (!results.rows) {
    Logger.log("No missing Productivity_Target data found.");
    return;
  }

  const managerSummary = {};

  results.rows.forEach(rowObj => {
    const row = rowObj.f;
    const managerName = row[0].v;
    const managerEmail = row[1].v;
    const dates = row[2].v || '';
    const workflow = row[3].v;
    const stepType = row[4].v;

    const datesArray = dates.split(', ');
    const uniqueDates = [...new Set(datesArray)];
    const uniqueDatesStr = uniqueDates.join(', ');

    if (!managerSummary[managerEmail]) {
      managerSummary[managerEmail] = {
        name: managerName,
        workflows: []
      };
    }

    managerSummary[managerEmail].workflows.push({
      workflow,
      stepType,
      dates: uniqueDatesStr
    });
  });

  // Send emails
  Object.entries(managerSummary).forEach(([email, manager]) => {
    const subject = `Missing Productivity Target - ${emailType}`;
    let body = `Hello ${manager.name},<br><br>
      Below is a summary of workflows with missing productivity targets:<br><br>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left; background-color: #f2f2f2;">Workflow</th>
            <th style="text-align: left; background-color: #f2f2f2;">Step Type</th>
            <th style="text-align: left; background-color: #f2f2f2;">Dates</th>
          </tr>
        </thead>
        <tbody>`;

    manager.workflows.forEach(wf => {
      body += `
        <tr>
          <td>${wf.workflow}</td>
          <td>${wf.stepType}</td>
          <td>${wf.dates}</td>
        </tr>`;
    });

    body += `</tbody></table><br><br>
      Please take necessary actions.<br><br>
      Best regards,<br>
      Analytics Bot`;

    MailApp.sendEmail({
      to: email,
      subject,
      htmlBody: body,
      from: 'alerts@yourdomain.com',
      name: 'Analytics Bot'
    });
  });
}

// Helpers
function getPreviousMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff - 7);
  return d;
}

function getCurrentMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function isLastFridayOfMonth(date) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastFriday = new Date(lastDay);
  while (lastFriday.getDay() !== 5) {
    lastFriday.setDate(lastFriday.getDate() - 1);
  }
  return (
    date.getFullYear() === lastFriday.getFullYear() &&
    date.getMonth() === lastFriday.getMonth() &&
    date.getDate() === lastFriday.getDate()
  );
}
