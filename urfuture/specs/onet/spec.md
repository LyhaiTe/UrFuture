# O*NET Web Services & Taxonomy Integration Specification

## 1. Overview & Objective

The Occupational Information Network (O*NET) is the primary source of occupational information in the United States, sponsored by the U.S. Department of Labor. In the UrFuture AI Career Advisor, O*NET provides:
- Standardized occupational classifications (`onetSocCode`, e.g. `15-1252.00` for Software Developers).
- The Content Model skill taxonomy (`onetElementId`, e.g. `2.B.3.f` for Programming).
- Verified importance levels (0–100 scale) for required technical, cognitive, and interpersonal competencies.
- Grounding context and verifiable citations for the RAG advisor copilot.

---

## 2. Credentials & Authentication

Credentials are configuration-managed through `.env`:

```env
# O*NET Web Services (skills/knowledge taxonomy reference only)
ONET_USERNAME="sn6024010087@camtech.edu.kh"
ONET_PASSWORD="$urfuture1$"
```

### Account Details
- **Registered Name**: Nut Sannara
- **Registered Email**: `sn6024010087@camtech.edu.kh`
- **Developer Organization**: `CamTech` (ID: 12232)
- **Registered Project**: `urfuture` (ID: 12375)
- **Portal Status**: Organization registration submitted and pending staff approval (`"active": false, "pending": true`).

### Authentication Flow
1. **Developer Portal Session**: Authenticates via `POST /developer/action/login` with session cookies (`account` and `acrd`).
2. **Web Services API v2.0**: Uses `X-API-Key: <key>` header on `https://api-v2.onetcenter.org/` endpoints once key generation is activated post-approval.
3. **Graceful Fallback**: Because O*NET staff approval takes 1–3 business days, the system embeds the verified O*NET 28.0 Content Model dataset directly, ensuring zero downtime for students.

---

## 3. Data Schema & Persisted Fields

The Prisma schema integrates O*NET metadata across three core models:

### `Skill`
- `id`: CUID identifier.
- `name`: Human-readable skill name (e.g., `Programming Fundamentals`).
- `category`: Taxonomy grouping (`Technical`, `Quantitative`, `Cognitive`, `Communication`, `Business`, `Science`).
- `onetElementId`: O*NET Content Model identifier (`2.B.3.f`, `2.B.3.g`, `2.C.3.a`, etc.).

### `CareerPath`
- `id`: CUID identifier.
- `title`: Standardized occupation title (`Software Engineer`, `Data Engineer`, etc.).
- `onetSocCode`: Standard Occupational Classification code (`15-1252.00`, `15-2051.00`, etc.).
- `descriptionShort`: O*NET occupational definition.
- `sourceNote`: Provenance string explicitly citing the O*NET-SOC code for counselor review.
- `requiredEducation`: Minimum academic stage (`EducationLevel` enum).

### `CareerSkillRequirement`
- `careerPathId`: Foreign key to `CareerPath`.
- `skillId`: Foreign key to `Skill`.
- `importance`: Float rating (0–100 scale) reflecting O*NET importance survey data.

---

## 4. Grounded Careers & Content Model Mapping

The integration maps 7 strategic career paths aligned with Cambodia's digital economy roadmap:

| Career Title | O*NET-SOC Code | Key O*NET Skills | Primary Element IDs |
| :--- | :--- | :--- | :--- |
| **Software Engineer** | `15-1252.00` | Programming, Data Structures, Systems Analysis, Testing | `2.B.3.f`, `2.B.3.g`, `2.B.3.a`, `2.B.3.d` |
| **Frontend Developer** | `15-1254.00` | Web Programming, UI/UX Engineering, API Integration | `2.B.3.f`, `2.C.3.b`, `2.B.3.b` |
| **Data Engineer** | `15-2051.00` | Database Systems, SQL, ETL Pipelines, Cloud Infrastructure | `2.C.3.a`, `2.B.3.g`, `2.B.3.b` |
| **Cloud & DevOps Engineer** | `15-1241.00` | Virtualization, CI/CD, Infrastructure as Code, Troubleshooting | `2.C.3.a`, `2.B.3.b`, `2.B.3.e` |
| **Cybersecurity Analyst** | `15-1212.00` | Network Defense, Vulnerability Assessment, Security Auditing | `2.C.3.a`, `2.B.3.d`, `2.B.3.a` |
| **Electrical Engineer** | `17-2071.00` | Circuit Design, Applied Physics, Calculus, Quality Control | `2.B.3.b`, `2.C.4.a`, `2.A.1.b` |
| **Business & Systems Analyst**| `13-1111.00` | Requirements Gathering, Systems Analysis, Financial Literacy | `2.B.3.a`, `2.C.9.a`, `2.A.1.d` |

---

## 5. RAG Copilot & Citation Contract

Grounding knowledge is persisted in:
`data/knowledge/onet-occupations-skills-taxonomy.md`

During user interaction in the Chat Copilot or Career Fit evaluation:
- The model cites `[O*NET-SOC xx-xxxx.xx]` and `[O*NET Element x.x.x.x]`.
- The guardrails verify groundedness against retrieved chunks via `estimateGroundednessAgainstChunks()`.
- Claims with valid citations achieve `groundednessScore >= 0.9`, satisfying the high-stakes recommendation threshold.

---

## 6. Implementation Components

1. **`src/lib/onet.ts`**:
   - `OnetWebService`: Service managing session authentication and live portal requests.
   - `TARGET_ONET_CAREERS`: Strongly typed list of verified career paths and skill requirements.
2. **`scripts/seed-onet-data.ts`**:
   - Database seeder script executing `prisma.careerPath.upsert()`, `prisma.skill.upsert()`, and `prisma.careerSkillRequirement.upsert()`.
3. **`data/knowledge/onet-occupations-skills-taxonomy.md`**:
   - Ingestion-ready markdown chunk source for vector search embedding.
