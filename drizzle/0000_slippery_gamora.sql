CREATE TYPE "public"."account_kind" AS ENUM('asset', 'liability', 'income', 'expense', 'equity');--> statement-breakpoint
CREATE TYPE "public"."account_role" AS ENUM('bank', 'cash', 'investment', 'debt', 'receivable', 'payable', 'category', 'opening');--> statement-breakpoint
CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_account_providerId_accountId_unique" UNIQUE("providerId","accountId")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"origin" text NOT NULL,
	"ruleId" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_userId_id_unique" UNIQUE("userId","id")
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"kind" "account_kind" NOT NULL,
	"role" "account_role" NOT NULL,
	"parentId" uuid,
	"personId" uuid,
	"bankName" text,
	"system" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_accounts_userId_id_unique" UNIQUE("userId","id"),
	CONSTRAINT "ledger_accounts_userId_key_unique" UNIQUE("userId","key"),
	CONSTRAINT "account_role_kind" CHECK (("ledger_accounts"."role" in ('bank', 'cash', 'investment', 'receivable') and "ledger_accounts"."kind" = 'asset') or ("ledger_accounts"."role" in ('debt', 'payable') and "ledger_accounts"."kind" = 'liability') or ("ledger_accounts"."role" = 'category' and "ledger_accounts"."kind" in ('income', 'expense')) or ("ledger_accounts"."role" = 'opening' and "ledger_accounts"."kind" = 'equity'))
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "people_userId_id_unique" UNIQUE("userId","id")
);
--> statement-breakpoint
CREATE TABLE "postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"entryId" uuid NOT NULL,
	"accountId" uuid NOT NULL,
	"amount" bigint NOT NULL,
	CONSTRAINT "posting_amount" CHECK ("postings"."amount" != 0 and abs("postings"."amount") <= 1000000000000)
);
--> statement-breakpoint
CREATE TABLE "booking_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"conditions" jsonb NOT NULL,
	"targetId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_rules_userId_id_unique" UNIQUE("userId","id")
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "api_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"hash" text NOT NULL,
	"prefix" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "api_tokens_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"accountId" uuid NOT NULL,
	"externalId" text NOT NULL,
	"date" date NOT NULL,
	"amount" bigint NOT NULL,
	"description" text NOT NULL,
	"counterparty" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"entryId" uuid,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_userId_accountId_externalId_unique" UNIQUE("userId","accountId","externalId"),
	CONSTRAINT "transaction_amount" CHECK ("transactions"."amount" != 0 and abs("transactions"."amount") <= 1000000000000)
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_ruleId_booking_rules_id_fk" FOREIGN KEY ("ruleId") REFERENCES "public"."booking_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_userId_parentId_ledger_accounts_userId_id_fk" FOREIGN KEY ("userId","parentId") REFERENCES "public"."ledger_accounts"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_userId_personId_people_userId_id_fk" FOREIGN KEY ("userId","personId") REFERENCES "public"."people"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postings" ADD CONSTRAINT "postings_userId_entryId_journal_entries_userId_id_fk" FOREIGN KEY ("userId","entryId") REFERENCES "public"."journal_entries"("userId","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postings" ADD CONSTRAINT "postings_userId_accountId_ledger_accounts_userId_id_fk" FOREIGN KEY ("userId","accountId") REFERENCES "public"."ledger_accounts"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_rules" ADD CONSTRAINT "booking_rules_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_rules" ADD CONSTRAINT "booking_rules_userId_targetId_ledger_accounts_userId_id_fk" FOREIGN KEY ("userId","targetId") REFERENCES "public"."ledger_accounts"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_auth_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_accountId_ledger_accounts_userId_id_fk" FOREIGN KEY ("userId","accountId") REFERENCES "public"."ledger_accounts"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_entryId_journal_entries_userId_id_fk" FOREIGN KEY ("userId","entryId") REFERENCES "public"."journal_entries"("userId","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_account_userId_index" ON "auth_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "journal_entries_userId_date_index" ON "journal_entries" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "postings_userId_accountId_index" ON "postings" USING btree ("userId","accountId");--> statement-breakpoint
CREATE INDEX "postings_entryId_index" ON "postings" USING btree ("entryId");--> statement-breakpoint
CREATE INDEX "auth_session_userId_index" ON "auth_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "transactions_userId_date_index" ON "transactions" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "transactions_userId_entryId_index" ON "transactions" USING btree ("userId","entryId");--> statement-breakpoint
CREATE INDEX "auth_verification_identifier_index" ON "auth_verification" USING btree ("identifier");--> statement-breakpoint
-- Check the final state of a booking at commit, after all postings and import links are saved.
CREATE FUNCTION assert_booking(booking uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE total numeric; line_count integer;
BEGIN
  IF booking IS NULL OR NOT EXISTS (SELECT 1 FROM journal_entries WHERE id = booking) THEN RETURN; END IF;
  SELECT coalesce(sum(amount), 0), count(DISTINCT "accountId") INTO total, line_count FROM postings WHERE "entryId" = booking;
  IF total <> 0 OR line_count < 2 THEN
    RAISE EXCEPTION 'A booking requires balanced postings on at least two accounts' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM transactions source WHERE source."entryId" = booking
    GROUP BY source."accountId"
    HAVING sum(source.amount) <> coalesce((SELECT sum(posting.amount) FROM postings posting WHERE posting."entryId" = booking AND posting."accountId" = source."accountId"), 0)
  ) THEN
    RAISE EXCEPTION 'A booking must preserve its imported amounts' USING ERRCODE = '23514';
  END IF;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION check_journal() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM assert_booking(NEW.id);
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION check_booking_links() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN PERFORM assert_booking(OLD."entryId"); END IF;
  IF TG_OP <> 'DELETE' THEN PERFORM assert_booking(NEW."entryId"); END IF;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER journal_balanced AFTER INSERT OR UPDATE ON journal_entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_journal();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER postings_balanced AFTER INSERT OR UPDATE OR DELETE ON postings DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_booking_links();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER imports_match_booking AFTER INSERT OR UPDATE OR DELETE ON transactions DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_booking_links();
