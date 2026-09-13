"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAction, useCommand } from "@/lib/client";
import type { Output } from "@/lib/ledger/commands";
import { euro } from "@/lib/utils";
import { Actions } from "./ui/actions";
import {
  Checkbox,
  Button,
  ScrollArea,
  Empty,
  ErrorMessage,
  Field,
  Input,
  Loading,
  Modal,
  PageHeader,
} from "./ui/controls";

type Person = Output<"overview">["people"][number];

export function People() {
  const data = useCommand("overview", {});
  const remove = useAction("delete_person");
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  return (
    <>
      <PageHeader title="People">
        <Button variant="primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Add person
        </Button>
      </PageHeader>
      <ErrorMessage error={data.error ?? remove.error} />
      {data.isPending ? (
        <Loading />
      ) : data.error ? null : !data.data?.people.length ? (
        <Empty>Add a person to track money owed between you.</Empty>
      ) : (
        <ScrollArea className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Person</th>
                <th className="text-right">Owed to me</th>
                <th className="text-right">I owe</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.people.map((person) => {
                const receivable = data.data.accounts.find(
                  (account) =>
                    account.personId === person.id &&
                    account.role === "receivable",
                );
                const payable = data.data.accounts.find(
                  (account) =>
                    account.personId === person.id &&
                    account.role === "payable",
                );
                return (
                  <tr
                    key={person.id}
                    className={person.archived ? "opacity-50" : ""}
                  >
                    <td>
                      {person.name}
                      {person.archived && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="number text-right text-primary">
                      <Link href={`/bookings?account=${receivable?.id}`}>
                        {euro(receivable?.balance ?? 0)}
                      </Link>
                    </td>
                    <td className="number text-right text-accent">
                      <Link href={`/bookings?account=${payable?.id}`}>
                        {euro(payable?.balance ?? 0)}
                      </Link>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Actions
                          name={person.name}
                          onEdit={() => setEditing(person)}
                          onDelete={() => remove.mutate({ id: person.id })}
                          pending={remove.isPending}
                          description="This also deletes the person's unused accounts. Archive the person to preserve bookings."
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      )}
      {editing && (
        <PersonForm
          person={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function PersonForm({
  person,
  onClose,
}: {
  person?: Person;
  onClose: () => void;
}) {
  const create = useAction("create_person");
  const update = useAction("update_person");
  const [name, setName] = useState(person?.name ?? "");
  const [archived, setArchived] = useState(person?.archived ?? false);
  return (
    <Modal title={person ? "Edit person" : "Add person"} onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (person)
            update.mutate(
              { id: person.id, name, archived },
              { onSuccess: onClose },
            );
          else create.mutate({ name }, { onSuccess: onClose });
        }}
      >
        <Field label="Name">
          <Input
            required
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        {person && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={archived}
              onCheckedChange={(value) => setArchived(value)}
            />
            Archived
          </label>
        )}
        <ErrorMessage error={create.error ?? update.error} />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            busy={create.isPending || update.isPending}
          >
            {person ? "Save changes" : "Create person"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
