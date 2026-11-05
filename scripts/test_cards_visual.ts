import { SAMPLE_RESUMES, SampleResume } from '../frontend/data/sample-resumes';
import puppeteer from 'puppeteer';
import fs from 'fs';

function getTemplateVariant(companyKey: string): 'double-column' | 'ivy-league' | 'sidebar' | 'classic' {
  if (['spotify', 'airbnb', 'figma', 'bytedance', 'uber', 'apple'].includes(companyKey)) return 'double-column';
  if (['goldman', 'citadel', 'deloitte', 'accenture', 'chime'].includes(companyKey)) return 'ivy-league';
  if (['netflix', 'stripe', 'sony', 'disney', 'tesla'].includes(companyKey)) return 'sidebar';
  return 'classic';
}

function renderCard(resume: SampleResume, idx: number) {
  const variant = getTemplateVariant(resume.companyKey);
  const exp1 = resume.experience[0];
  const exp2 = resume.experience[1];
  const proj1 = resume.projects?.[0];
  const certs = resume.certifications;

  if (variant === 'sidebar') {
    return `
    <div id="card-${idx}" style="width: 270px; height: 350px; background: white; font-family: ui-sans-serif, system-ui, sans-serif; display: flex; border: 1px solid #e4e4e7; box-sizing: border-box; overflow: hidden; border-radius: 4px;">
      <div style="width: 34%; background: #1e293b; color: white; padding: 10px 8px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
        <div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; margin: 0 auto 6px;">
            ${resume.candidate.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div style="font-size: 6px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid #334155; padding-bottom: 1px; margin-bottom: 3px;">Contact</div>
          <div style="font-size: 4.8px; color: #cbd5e1; line-height: 1.35;">
            <div>${resume.candidate.location}</div>
            <div style="word-break: break-all;">${resume.candidate.email}</div>
            <div>${resume.candidate.phone}</div>
            <div style="color: #60a5fa;">${resume.candidate.linkedin ? resume.candidate.linkedin.replace('linkedin.com/in/', '') : ''}</div>
          </div>
        </div>

        <div>
          <div style="font-size: 6px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid #334155; padding-bottom: 1px; margin-bottom: 3px;">Skills</div>
          <div style="font-size: 4.8px; color: #cbd5e1; line-height: 1.35;">
            ${resume.skills.slice(0, 3).map(s => `
              <div style="margin-bottom: 2px;">
                <span style="color: #f8fafc; font-weight: 600;">${s.category}:</span><br/>
                ${s.skills.slice(0, 4).join(', ')}
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div style="font-size: 6px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid #334155; padding-bottom: 1px; margin-bottom: 3px;">Education</div>
          <div style="font-size: 4.8px; color: #cbd5e1; line-height: 1.3;">
            <div style="font-weight: 600; color: white;">${resume.education[0]?.degree}</div>
            <div style="color: #94a3b8;">${resume.education[0]?.school}</div>
          </div>
        </div>
      </div>

      <div style="width: 66%; padding: 10px 10px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; color: #1e293b;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; line-height: 1.1;">${resume.candidate.name}</div>
          <div style="font-size: 6px; font-weight: 600; color: #2563eb; margin-top: 1px;">${resume.candidate.title}</div>
          <div style="height: 1px; background: #2563eb; width: 24px; margin: 3px 0 4px;"></div>
          <div style="font-size: 5px; line-height: 1.35; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${resume.summary}</div>
        </div>

        <div>
          <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 1px; margin-bottom: 3px;">Experience</div>
          ${exp1 ? `
            <div style="margin-bottom: 3px;">
              <div style="font-size: 5.2px; font-weight: bold; color: #0f172a;">${exp1.title}</div>
              <div style="font-size: 4.8px; color: #64748b;">${exp1.company} &bull; ${exp1.startDate} &ndash; ${exp1.current ? 'Present' : exp1.endDate}</div>
              ${exp1.bullets.slice(0, 3).map(b => `
                <div style="font-size: 4.8px; line-height: 1.3; color: #334155; display: flex; gap: 2px;">
                  <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${exp2 ? `
            <div>
              <div style="font-size: 5.2px; font-weight: bold; color: #0f172a;">${exp2.title}</div>
              <div style="font-size: 4.8px; color: #64748b;">${exp2.company} &bull; ${exp2.startDate} &ndash; ${exp2.endDate}</div>
              ${exp2.bullets.slice(0, 2).map(b => `
                <div style="font-size: 4.8px; line-height: 1.3; color: #334155; display: flex; gap: 2px;">
                  <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        ${proj1 ? `
          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 1px; margin-bottom: 2px;">Key Project</div>
            <div style="font-size: 5px; font-weight: bold; color: #0f172a;">${proj1.name}</div>
            <div style="font-size: 4.8px; line-height: 1.3; color: #334155;">${proj1.highlights[0]}</div>
          </div>
        ` : ''}

        <div style="border-top: 0.5px solid #e2e8f0; padding-top: 2px; display: flex; justify-content: space-between; font-size: 4.5px; color: #94a3b8;">
          <span>ATS Score: ${resume.atsScore}/100</span>
          <span>Verified Layout</span>
        </div>
      </div>
    </div>
    `;
  }

  if (variant === 'double-column') {
    return `
    <div id="card-${idx}" style="width: 270px; height: 350px; background: white; font-family: ui-sans-serif, system-ui, sans-serif; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e4e4e7; box-sizing: border-box; overflow: hidden; border-radius: 4px; padding: 10px 10px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #0f172a; padding-bottom: 3px;">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; line-height: 1.1;">${resume.candidate.name}</div>
          <div style="font-size: 5.8px; font-weight: 600; color: #059669; margin-top: 1px;">${resume.candidate.title}</div>
        </div>
        <div style="font-size: 4.8px; color: #64748b; text-align: right; line-height: 1.3;">
          <div>${resume.candidate.location} &bull; ${resume.candidate.phone}</div>
          <div style="color: #059669;">${resume.candidate.email}</div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; flex: 1; padding: 5px 0;">
        <div style="width: 35%; display: flex; flex-direction: column; justify-content: space-between; border-right: 0.5px solid #e2e8f0; padding-right: 6px;">
          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Technical Skills</div>
            ${resume.skills.slice(0, 4).map(s => `
              <div style="font-size: 4.8px; line-height: 1.3; margin-bottom: 2px;">
                <span style="font-weight: bold; color: #0f172a;">${s.category}:</span><br/>
                <span style="color: #475569;">${s.skills.slice(0, 3).join(', ')}</span>
              </div>
            `).join('')}
          </div>

          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Education</div>
            <div style="font-size: 4.8px; color: #334155;">
              <div style="font-weight: bold;">${resume.education[0]?.degree}</div>
              <div style="color: #64748b;">${resume.education[0]?.school}</div>
              <div style="color: #059669;">${resume.education[0]?.graduationDate}</div>
            </div>
          </div>

          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Certifications</div>
            <div style="font-size: 4.8px; color: #475569;">
              ${certs?.slice(0, 2).map(c => '<div>&bull; ' + c + '</div>').join('') || ''}
            </div>
          </div>
        </div>

        <div style="width: 65%; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Profile Summary</div>
            <div style="font-size: 4.8px; line-height: 1.35; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${resume.summary}</div>
          </div>

          <div>
            <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Experience</div>
            ${exp1 ? `
              <div style="margin-bottom: 3px;">
                <div style="display: flex; justify-content: space-between; font-size: 5px; font-weight: bold;">
                  <span>${exp1.title}</span>
                  <span style="color: #64748b; font-weight: normal;">${exp1.startDate} &ndash; ${exp1.current ? 'Present' : exp1.endDate}</span>
                </div>
                <div style="font-size: 4.8px; color: #64748b; font-style: italic;">${exp1.company}</div>
                ${exp1.bullets.slice(0, 3).map(b => `
                  <div style="font-size: 4.8px; line-height: 1.3; color: #334155; display: flex; gap: 2px;">
                    <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${exp2 ? `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 5px; font-weight: bold;">
                  <span>${exp2.title}</span>
                  <span style="color: #64748b; font-weight: normal;">${exp2.startDate} &ndash; ${exp2.endDate}</span>
                </div>
                <div style="font-size: 4.8px; color: #64748b; font-style: italic;">${exp2.company}</div>
                ${exp2.bullets.slice(0, 2).map(b => `
                  <div style="font-size: 4.8px; line-height: 1.3; color: #334155; display: flex; gap: 2px;">
                    <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          ${proj1 ? `
            <div>
              <div style="font-size: 6px; font-weight: bold; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 2px;">Key Project</div>
              <div style="font-size: 5px; font-weight: bold;">${proj1.name}</div>
              <div style="font-size: 4.8px; line-height: 1.3; color: #475569;">${proj1.highlights[0]}</div>
            </div>
          ` : ''}
        </div>
      </div>

      <div style="border-top: 0.5px solid #e2e8f0; padding-top: 2px; display: flex; justify-content: space-between; font-size: 4.5px; color: #94a3b8;">
        <span>Verified ATS Double-Column</span>
        <span>ATS Score: ${resume.atsScore}/100</span>
      </div>
    </div>
    `;
  }

  if (variant === 'ivy-league') {
    return `
    <div id="card-${idx}" style="width: 270px; height: 350px; background: white; font-family: Georgia, serif; color: #18181b; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e4e4e7; box-sizing: border-box; overflow: hidden; border-radius: 4px;">
      <div style="text-align: center; border-bottom: 1px double #18181b; padding-bottom: 3px;">
        <div style="font-weight: bold; font-size: 11.5px; letter-spacing: 0.04em; color: #09090b; text-transform: uppercase;">${resume.candidate.name}</div>
        <div style="font-size: 5.5px; font-style: italic; color: #3f3f46; margin-top: 1px;">${resume.candidate.title}</div>
        <div style="font-size: 4.8px; color: #52525b; margin-top: 1px;">${resume.candidate.location} &bull; ${resume.candidate.email} &bull; ${resume.candidate.phone}</div>
      </div>

      <div>
        <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #18181b; padding-bottom: 1px; margin-bottom: 2px;">Executive Profile</div>
        <div style="font-size: 4.9px; line-height: 1.35; color: #27272a; text-align: justify; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${resume.summary}</div>
      </div>

      <div>
        <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #18181b; padding-bottom: 1px; margin-bottom: 2px;">Core Competencies & Frameworks</div>
        ${resume.skills.slice(0, 3).map(s => `
          <div style="font-size: 4.8px; line-height: 1.3; color: #27272a;">
            <strong>${s.category}:</strong> ${s.skills.join(', ')}
          </div>
        `).join('')}
      </div>

      <div>
        <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #18181b; padding-bottom: 1px; margin-bottom: 2px;">Professional Experience</div>
        ${exp1 ? `
          <div style="margin-bottom: 3px;">
            <div style="display: flex; justify-content: space-between; font-size: 5.2px; font-weight: bold;">
              <span>${exp1.title}</span>
              <span style="font-style: italic; font-weight: normal;">${exp1.startDate} &ndash; ${exp1.current ? 'Present' : exp1.endDate}</span>
            </div>
            <div style="font-size: 4.8px; color: #52525b;">${exp1.company} &bull; ${exp1.location}</div>
            ${exp1.bullets.slice(0, 3).map(b => `
              <div style="font-size: 4.8px; line-height: 1.3; color: #27272a; display: flex; gap: 2px;">
                <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${exp2 ? `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 5.2px; font-weight: bold;">
              <span>${exp2.title}</span>
              <span style="font-style: italic; font-weight: normal;">${exp2.startDate} &ndash; ${exp2.endDate}</span>
            </div>
            <div style="font-size: 4.8px; color: #52525b;">${exp2.company} &bull; ${exp2.location}</div>
            ${exp2.bullets.slice(0, 2).map(b => `
              <div style="font-size: 4.8px; line-height: 1.3; color: #27272a; display: flex; gap: 2px;">
                <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div>
        <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #18181b; padding-bottom: 1px; margin-bottom: 2px;">Education &amp; Honors</div>
        ${resume.education.slice(0, 2).map(edu => `
          <div style="display: flex; justify-content: space-between; font-size: 4.9px;">
            <span>${edu.degree} in ${edu.field} &ndash; ${edu.school}</span>
            <span>${edu.graduationDate}</span>
          </div>
        `).join('')}
      </div>

      ${certs?.length ? `
        <div>
          <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #18181b; padding-bottom: 1px; margin-bottom: 2px;">Certifications</div>
          <div style="font-size: 4.8px; color: #27272a;">&bull; ${certs.slice(0, 3).join(' &bull; ')}</div>
        </div>
      ` : ''}

      <div style="border-top: 0.5px solid #71717a; padding-top: 2px; display: flex; justify-content: space-between; font-size: 4.5px; color: #71717a;">
        <span>Ivy League Academic Standard</span>
        <span>ATS Score: ${resume.atsScore}/100</span>
      </div>
    </div>
    `;
  }

  // Classic Single Column
  return `
  <div id="card-${idx}" style="width: 270px; height: 350px; background: white; color: #18181b; padding: 10px 12px; font-family: ui-sans-serif, system-ui, sans-serif; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e4e4e7; box-sizing: border-box; overflow: hidden; border-radius: 4px;">
    <div style="text-align: center; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 3px;">
      <div style="font-family: Georgia, serif; font-weight: bold; font-size: 11px; line-height: 1.1; color: #09090b;">${resume.candidate.name}</div>
      <div style="font-size: 5.8px; font-weight: 600; color: #285fea; margin-top: 1px;">${resume.candidate.title}</div>
      <div style="font-size: 5px; color: #52525b; margin-top: 1px;">${resume.candidate.location} &bull; ${resume.candidate.email} &bull; ${resume.candidate.phone}</div>
      <div style="font-size: 4.8px; color: #285fea; margin-top: 1px;">${resume.candidate.linkedin} ${resume.candidate.github ? '&bull; ' + resume.candidate.github : ''}</div>
    </div>
    <div>
      <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 1px; margin-bottom: 2px;">Professional Summary</div>
      <div style="font-size: 5px; line-height: 1.35; color: #3f3f46; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${resume.summary}</div>
    </div>
    <div>
      <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 1px; margin-bottom: 2px;">Core Skills & Expertise</div>
      ${resume.skills.slice(0, 4).map(s => `
        <div style="font-size: 4.8px; line-height: 1.25; color: #3f3f46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <strong style="color: #09090b;">${s.category}:</strong> ${s.skills.join(', ')}
        </div>
      `).join('')}
    </div>
    <div>
      <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 1px; margin-bottom: 2px;">Professional Experience</div>
      ${exp1 ? `
        <div style="margin-bottom: 3px;">
          <div style="display: flex; justify-content: space-between; font-size: 5.2px; font-weight: bold; color: #09090b;">
            <span>${exp1.title}</span>
            <span style="color: #71717a; font-weight: normal;">${exp1.startDate} &ndash; ${exp1.current ? 'Present' : exp1.endDate}</span>
          </div>
          <div style="font-size: 4.8px; color: #52525b; font-style: italic;">${exp1.company} &bull; ${exp1.location}</div>
          ${exp1.bullets.slice(0, 3).map(b => `
            <div style="font-size: 4.8px; line-height: 1.3; color: #3f3f46; display: flex; gap: 2px;">
              <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${exp2 ? `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 5.2px; font-weight: bold; color: #09090b;">
            <span>${exp2.title}</span>
            <span style="color: #71717a; font-weight: normal;">${exp2.startDate} &ndash; ${exp2.endDate}</span>
          </div>
          <div style="font-size: 4.8px; color: #52525b; font-style: italic;">${exp2.company} &bull; ${exp2.location}</div>
          ${exp2.bullets.slice(0, 2).map(b => `
            <div style="font-size: 4.8px; line-height: 1.3; color: #3f3f46; display: flex; gap: 2px;">
              <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    ${proj1 ? `
      <div>
        <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 1px; margin-bottom: 2px;">Key Projects & Initiatives</div>
        <div style="font-size: 5.2px; font-weight: bold; color: #09090b;">${proj1.name} <span style="font-weight: normal; color: #52525b;">&ndash; ${proj1.description}</span></div>
        ${proj1.highlights?.[0] ? `
          <div style="font-size: 4.8px; line-height: 1.3; color: #3f3f46; display: flex; gap: 2px;">
            <span>&bull;</span><span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${proj1.highlights[0]}</span>
          </div>
        ` : ''}
      </div>
    ` : ''}
    <div>
      <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: #09090b; border-bottom: 0.5px solid #e4e4e7; padding-bottom: 1px; margin-bottom: 2px;">Education &amp; Credentials</div>
      ${resume.education?.[0] ? `
        <div style="display: flex; justify-content: space-between; font-size: 5px; color: #09090b; font-weight: 600;">
          <span>${resume.education[0].degree} in ${resume.education[0].field} &ndash; ${resume.education[0].school}</span>
          <span style="color: #71717a; font-weight: normal;">${resume.education[0].graduationDate}</span>
        </div>
      ` : ''}
      ${certs && certs.length > 0 ? `
        <div style="font-size: 4.8px; color: #3f3f46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
          &bull; ${certs.slice(0, 3).join(' &bull; ')}
        </div>
      ` : ''}
    </div>
    <div style="border-top: 0.5px solid #e4e4e7; padding-top: 2px; display: flex; justify-content: space-between; font-size: 4.5px; color: #a1a1aa;">
      <span>Verified Single-Column ATS Format</span>
      <span>ATS Score: ${resume.atsScore}/100</span>
    </div>
  </div>
  `;
}

async function main() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="background: #0b0d11; padding: 30px; display: flex; gap: 20px; flex-wrap: wrap;">
    ${SAMPLE_RESUMES.map(renderCard).join('')}
  </body>
  </html>
  `;

  fs.writeFileSync('/tmp/all_28_cards.html', html);
  console.log('Wrote all 28 cards to /tmp/all_28_cards.html');

  const browser = await puppeteer.launch({ headless: true, executablePath: '/home/abhi-singh/.local/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200 });
  await page.goto('file:///tmp/all_28_cards.html');

  // Goldman Sachs is index 11
  const goldmanCard = await page.$('#card-11');
  if (goldmanCard) await goldmanCard.screenshot({ path: '/tmp/goldman_card.png' });

  // Spotify is index 20
  const spotifyCard = await page.$('#card-20');
  if (spotifyCard) await spotifyCard.screenshot({ path: '/tmp/spotify_card.png' });

  await browser.close();
  console.log('Screenshots captured successfully');
}

main().catch(console.error);
