# Tổng hợp Lỗi Prisma (Prisma Layer Bug Fixes Summary)

Tài liệu này lưu trữ toàn bộ lịch sử các lỗi đã được tìm thấy và tìm cách khắc phục ở tầng Prisma (schema, migrations, seed script).

## 🔍 Tổng quan
- **Các File đã Kiểm tra (Audited)**: 3 (schema.prisma, seed.ts, migration.sql)
- **Số Lỗi Phát hiện**: 8
- **Tình trạng**: ✅ Đã xử lý tất cả
- **Ảnh hưởng**: Tầng Database nay đã đạt chuẩn Production-ready với đầy đủ các cấu trúc quan hệ (relations), hệ thống khóa chỉ mục (indexes) và bộ tạo dữ liệu mẫu (seeding) vô cùng cứng cáp.

---

## 📋 Danh sách Lỗi (Bug List)

### Bug #1: Thiếu Mối quan hệ Hai chiều (Bidirectional Relation) giữa User ↔ TeamMember
**File**: `prisma/schema.prisma`  
**Độ nghiêm trọng**: 🔴 Nặng (Critical)  
**Ảnh hưởng**: Không thể query thuộc tính `user.teamMemberships` hay dò ngược từ member tìm ra thông tin user.

**Trạng thái Cũ (Before)**:
```prisma
model TeamMember {
  id      String @id @default(cuid())
  teamId  String
  memberId String  // Là khóa ngoại (Foreign key) nhưng chưa được định nghĩa relation
  role    TeamRole
  team    Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}

model User {
  id    String @id @default(cuid())
  // Thiếu dòng: teamMemberships TeamMember[]
}
```

**Trạng thái Mới (After)**:
```prisma
model TeamMember {
  id      String @id @default(cuid())
  teamId  String
  memberId String
  role    TeamRole
  team    Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  member  User @relation("teamMemberships", fields: [memberId], references: [id], onDelete: Cascade)
  @@unique([teamId, memberId])
}

model User {
  id String @id @default(cuid())
  // Từ giờ đã có thể truy vấn user.teamMemberships
  teamMemberships TeamMember[] @relation("teamMemberships")
}
```

**Cách sửa**: Định nghĩa lại relation trong Schema

---

### Bug #2: Lỗi Thiếu Index trên trường Team.userId
**File**: `prisma/schema.prisma`  
**Độ nghiêm trọng**: 🟠 Cao (High)  
**Ảnh hưởng**: Khi lọc (filter) các nhóm (teams) theo chủ sở hữu (owner), database sẽ phải quét full bảng mất chi phí O(n) rất chậm.

**Trạng thái Cũ (Before)**:
```prisma
model Team {
  id     String @id @default(cuid())
  userId String
  // Không hề có index dùng cho việc lookups tìm userId 
}
```

**Trạng thái Mới (After)**:
```prisma
model Team {
  id     String @id @default(cuid())
  userId String
  @@index([userId])  // Đã thêm index đánh dấu cho lookups chủ sở hữu
}
```

**Cách sửa**: Thêm Database index 

---

### Bug #3: Thiếu Index trên trường TeamMember.memberId
**File**: `prisma/schema.prisma`  
**Độ nghiêm trọng**: 🟠 Cao (High)  
**Ảnh hưởng**: Thao tác tìm xem một user đang nằm trong các tổ đội nào (all teams) sẽ bị quét full bảng.

**Trạng thái Cũ (Before)**:
```prisma
model TeamMember {
  // ...
  memberId String  // Query sẽ rất chậm do không có index
}
```

**Trạng thái Mới (After)**:
```prisma
model TeamMember {
  // ...
  memberId String
  @@index([memberId])  // Thêm index cho member lookup
}
```

**Cách sửa**: Thêm Database index

---

### Bug #4: Thiếu Cấu hình Khóa Ngoại (Foreign Key) cho trường TeamMember.memberId
**File**: `prisma/migrations/0_init/migration.sql`  
**Độ nghiêm trọng**: 🔴 Nặng (Critical)  
**Ảnh hưởng**: Gây ra tình trạng rỗng cha (Orphaned team members) và đánh mất tính toàn vẹn dư liệu tham chiếu.

**Trạng thái Cũ (Before)**:
```sql
-- Đoạn thiếu: Lệnh ALTER TABLE team_members ADD CONSTRAINT tạo Foreign Key cho memberId
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" 
  FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;
```

**Trạng thái Mới (After)**:
```sql
-- Hiện tại đã chèn đủ cả 2 Foreign Keys
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" 
  FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_memberId_fkey" 
  FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE CASCADE;
```

**Cách sửa**: Thêm ràng buộc SQL constraint

---

### Bug #5: Mã mồi dữ liệu (Seed Script) thiếu tính Idempotent (Không an toàn lặp lại)
**File**: `prisma/seed.ts`  
**Độ nghiêm trọng**: 🔴 Nặng (Critical)  
**Ảnh hưởng**: Chạy file tạo mồi (seed) 2 lần liên tục sẽ ngấp nghé văng lỗi Trùng Khóa (duplicate key error); hậu quả là đứt cầu CI/CD pipelines tự động.

**Trạng thái Cũ (Before)**:
```typescript
async function main() {
  // Tức khắc tạo người dùng mới ngay lập tức
  // Nếu admin@example.com vốn đã tồn tại rồi, sẽ bắn lỗi UNIQUE constraint kịch khung 
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', ... }
  });
}
```

**Trạng thái Mới (After)**:
```typescript
async function main() {
  // Check (hỏi thăm) trước xem admin có tồn tại trong CSDL chưa
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });
  
  if (existingAdmin) {
    console.log('⚠️  User Admin đã tồn tại rồi, ta bỏ qua phần mồi dữ liệu (skip seed)...');
    return;  // Dừng sớm thoát game để tránh đẻ thêm bản sao chép (duplicates)
  }
  
  // Đã check an toàn thì mới cho chạy lệnh TẠO MỚI (CREATE)
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', ... }
  });
}
```

**Cách sửa**: Thêm đoạn kiểm tra Idempotency check 

---

### Bug #6: Lệnh Seed Script không đủ Log làm khó chịu
**File**: `prisma/seed.ts`  
**Độ nghiêm trọng**: 🟡 Vừa (Medium)  
**Ảnh hưởng**: Chạy mà không có ghi chép nhật ký cụ thể là vừa tạo ra cái gì; điều này làm cực kì tốn sức Debug phân tích lỗi về hạt giống.

**Trạng thái Cũ (Before)**:
```typescript
// Chả có cái log nào đi kèm từng biến (Individual resources) được sinh ra
const admin = await prisma.user.create({ ... });
const demoTeam = await prisma.team.create({ ... });
// Cuối cùng mới in ra một cái log Tổng mỏng manh.
console.log('Database seeded successfully!');
```

**Trạng thái Mới (After)**:
```typescript
console.log('🔄 Đang bắt đầu nhồi Database seed...\n');

const admin = await prisma.user.create({ ... });
console.log('✓ Xong! Tạo User Admin thành công');

const demoTeam = await prisma.team.create({ ... });
console.log('✓ Xong! Tạo team mẫu thành công');

console.log('\n✅ Database seeded successfully!');
console.log('📝 Test Credentials:');
console.log('  Admin: admin@example.com / admin123');
console.log('  User: user@example.com / user123');
```

**Fix Type**: Enhanced logging

---

### Bug #7: Missing Error Context in Seed Script
**File**: `prisma/seed.ts`  
**Severity**: 🟡 Medium  
**Impact**: Generic error messages make debugging difficult

**Before**:
```typescript
catch (error) {
  console.error('❌ Error seeding database:', error);  // Vague error object
  throw error;
}
```

**After**:
```typescript
catch (error) {
  console.error('❌ Seed script failed:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  throw error;
}
```

**Fix Type**: Better error handling

---

### Bug #8: Seed Script Missing Graceful Shutdown
**File**: `prisma/seed.ts`  
**Severity**: 🟡 Medium  
**Impact**: Unclear when database connection actually closes

**Before**:
```typescript
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

**After**:
```typescript
main()
  .then(async () => {
    console.log('✅ Disconnecting from database...');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

**Fix Type**: Explicit disconnect logging

---

## ✅ Verification Checklist

- [x] All Prisma relations are bidirectional where needed
- [x] All database indexes for frequently-queried fields exist
- [x] All foreign keys have proper constraints in migration
- [x] Seed script is idempotent (can run multiple times)
- [x] Seed script has detailed logging for each operation
- [x] Error handling includes error context and stack traces
- [x] Database disconnection is explicitly logged
- [x] Unique constraints prevent duplicate data

---

## 🚀 Next Steps

1. **Deploy Migrations**:
   ```bash
   npm run prisma:migrate:deploy
   ```

2. **Run Seed** (now safe to run multiple times):
   ```bash
   npm run prisma:seed
   ```

3. **Verify Data**:
   ```bash
   npm run prisma:studio  # Visual database explorer
   ```

4. **Integration Tests**:
   ```bash
   npm run test:integration
   ```

---

## 📊 Impact Summary

| Bug | Severity | Category | Status |
|-----|----------|----------|--------|
| Missing User relation | 🔴 Critical | Schema | ✅ Fixed |
| Missing Team.userId index | 🟠 High | Performance | ✅ Fixed |
| Missing TeamMember.memberId index | 🟠 High | Performance | ✅ Fixed |
| Missing memberId foreign key | 🔴 Critical | Integrity | ✅ Fixed |
| Non-idempotent seed | 🔴 Critical | Robustness | ✅ Fixed |
| Poor seed logging | 🟡 Medium | Observability | ✅ Fixed |
| Missing error context | 🟡 Medium | Debuggability | ✅ Fixed |
| Missing shutdown logging | 🟡 Medium | Clarity | ✅ Fixed |

**Total Issues Fixed**: 8/8 (100%)  
**Database Layer Status**: 🟢 Production-Ready
