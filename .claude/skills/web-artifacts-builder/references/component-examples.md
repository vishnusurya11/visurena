# React + shadcn/ui Component Examples

Copy-pasteable patterns for the components shipped by `init-artifact.sh` (40+ shadcn/ui
components pre-installed under `@/components/ui/`). All examples are TypeScript + Tailwind and
assume the path alias `@/` and the shadcn theme tokens (`bg-background`, `text-foreground`,
`bg-primary`, etc.) configured by the init script.

## Button (variants + icon)

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export function Actions({ loading }: { loading?: boolean }) {
  return (
    <div className="flex gap-3">
      <Button>Get started</Button>
      <Button variant="secondary">Learn more</Button>
      <Button variant="outline" size="icon" aria-label="Next">
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
```

## Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PricingCard() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Pro</CardTitle>
        <CardDescription>For growing teams</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          <li>Unlimited projects</li>
          <li>Priority support</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Choose Pro</Button>
      </CardFooter>
    </Card>
  );
}
```

## Form (react-hook-form + zod + shadcn Form)

`react-hook-form`, `@hookform/resolvers`, and `zod` are pre-installed. This is the recommended
shadcn form pattern with accessible labels, validation, and error messages.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export function SignupForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  function onSubmit(values: Values) {
    console.log(values); // wire to your handler
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Ada Lovelace" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="ada@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>Sign up</Button>
      </form>
    </Form>
  );
}
```

## Dialog (modal)

```tsx
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="destructive">Delete</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Tabs + state (React)

```tsx
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function Panel() {
  const [tab, setTab] = useState("overview");
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
    </Tabs>
  );
}
```

## Toast (sonner — pre-installed)

```tsx
// In your root component, mount once:
import { Toaster } from "@/components/ui/sonner";
// <Toaster richColors position="top-right" />

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SaveButton() {
  return <Button onClick={() => toast.success("Saved!")}>Save</Button>;
}
```

## Adding a component not in the bundle

The init script pre-installs 40+ components. If you need one that isn't there, add it with the
CLI (React 19 may require a flag on npm):

```bash
pnpm dlx shadcn@latest add <component>
# npm users with React 19: npx shadcn@latest add <component> --legacy-peer-deps
```

## Theming note

Colors come from CSS variables in `src/index.css` (`--background`, `--primary`, `--accent`, …)
consumed via Tailwind tokens (`bg-primary`, `text-muted-foreground`). To rebrand, edit those
HSL variables — every component updates. For the Visurena house style, set a charcoal dark
base and one disciplined accent (see the award-winning playbook referenced in SKILL.md).
