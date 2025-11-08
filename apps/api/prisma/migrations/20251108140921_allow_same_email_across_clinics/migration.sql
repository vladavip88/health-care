-- Drop the existing unique constraint on email
DROP INDEX "User_email_key";

-- Create a new composite unique constraint on email and clinicId
CREATE UNIQUE INDEX "User_email_clinicId_key" ON "User"("email", "clinicId");
