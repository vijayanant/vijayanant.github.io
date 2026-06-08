---
description: Why collaboration becomes a distributed systems problem
  once data is immutable and encrypted.
seo_title: Collaborative Editing on Encrypted, Content‑Addressed Data
title: The Sync Paradox
---

# The Sync Paradox

In the previous explorations, we slowly removed trust from the web.

We learned how to verify data using content addressing.\
We learned how to prove authorship using cryptographic identity.\
We learned how to hide data from infrastructure using encryption.\
We learned how to share it using time‑bound capabilities.

Individually, each layer felt like progress.

Then something very ordinary happened.

The same document changed in two places at once.

And everything broke.

------------------------------------------------------------------------

# A Perfectly Normal Day

You edit a note on your laptop during a flight.

Later that evening, you open the same note on your phone and add a few
lines.

Meanwhile, your collaborator updates the shared version while you are
still offline.

Nothing unusual happened.

No hackers.\
No malicious actors.\
No broken crypto.

Just three people making legitimate edits.

When the devices reconnect, the system now has three different versions
of the same document.

All three are valid.\
All three are legitimate.\
All three are encrypted.

Which one wins?

Traditional software has a simple answer.

The server decides.

But in the architecture we have been building, the server cannot read
the data, cannot understand the edits, and cannot be trusted to choose a
winner.

At some point in this journey, we quietly removed the referee.

And without a referee, collaboration becomes a distributed systems
problem.

This is the Sync Paradox.

------------------------------------------------------------------------

# The Trap We Built For Ourselves

Before we try to solve this problem, we need to admit something
uncomfortable.

We made sync hard on purpose.

From the **Integrity** layer, we chose content‑addressed storage.

Data became immutable. Change the content and the address changes.
Editing a file in place stopped being a thing.

From the **Privacy** layer, we chose encryption.

Infrastructure became blind. Servers cannot read data. They cannot
compute diffs. They cannot merge edits.

From the **Sharing** layer, we allowed multiple writers.

And the moment multiple writers exist, concurrency appears.

Individually, each decision made the system safer.

Together, they created a trap.

Sync must now operate under three constraints:

Immutability.\
Opacity.\
Concurrency.

Any two are manageable. All three together create the Sync Paradox.

------------------------------------------------------------------------

# The First Idea Everyone Has

The first sync strategy sounds completely reasonable.

When a file changes, upload the newest version and overwrite the old
one.

This works beautifully.

Until devices go offline.

Now imagine two devices editing the same document while disconnected.
When they reconnect, both believe they hold the newest version.

Both are right.

We try timestamps next.

Surely time can tell us which version is newer.

Except devices disagree about time. Clocks drift.\
Timezones exist.\
Users change system clocks.\
Updates arrive out of order.

"Latest" turns out to be a guess.

This is the moment sync stops being a storage problem and becomes a
physics problem.

Distributed systems do not agree on time.

------------------------------------------------------------------------

# The Realisation That Changes Everything

At this point, something subtle but important clicks.

We keep trying to update files.

But in a content‑addressed world, files never change.

Every edit creates a new object. Every version references the version
before it.

Over time, something unexpected appears.

A history.

Not a timeline. A graph.

If this feels familiar, it should.

Git has been living in this world for years.

Git never overwrites files.\
Git grows history.

Branches appear.\
Commits diverge.\
Merges reconcile.

The moment this clicks, the problem reframes itself.

Sync is not about updating files.

Sync is about merging histories.

------------------------------------------------------------------------

# When Histories Diverge

Two people edit the same document.

Two valid histories appear.

Neither is wrong. Neither is malicious. Neither can be rejected.

But they cannot both be the future.

This is the hidden villain of sync.

Concurrency.

More precisely, *concurrent intent without shared context*.

Each user believes they edited the same document.

In a content‑addressed world, they created two different documents.

Conflict is not failure.

Conflict is evidence that collaboration happened.

------------------------------------------------------------------------

# The Server Cannot Help Anymore

In traditional systems, the server would step in now.

It would inspect the changes.\
It would pick a winner.\
It would merge the edits.\
It would resolve the conflict.

But our server is blind.

It stores encrypted blobs.\
It forwards updates.\
It cannot read the document.

We did this deliberately.

We removed trust from storage.

Now we must remove authority from coordination.

------------------------------------------------------------------------

# A Strange Requirement Emerges

We need a way for multiple devices to edit data:

Offline.\
Out of order.\
Without trusted servers.\
Without shared clocks.

And we need every replica to eventually agree.

This sounds impossible.

For a long time, it mostly was.

------------------------------------------------------------------------

# Edits Instead of Files

The breakthrough begins with a small shift.

Stop syncing files. Start syncing edits.

Instead of replacing documents, devices exchange operations.

Insert this text.\
Delete that character.\
Add this item to the list.

Suddenly, we are no longer comparing entire documents. We are replaying
histories.

And histories are much easier to merge than files.

------------------------------------------------------------------------

# When Math Replaces Authority

Researchers gave these ideas an intimidating name.

Conflict‑free Replicated Data Types.

CRDTs.

The name sounds complex. The idea is surprisingly simple.

Design data structures whose edits can be applied in any order.

No matter when operations arrive.\
No matter which device created them.\
No matter how long the network was offline.

All replicas eventually converge to the same result.

No leader.\
No global clock.\
No trusted server.

Just mathematics and replication.

------------------------------------------------------------------------

# The Helper Evolves Again

In earlier posts, the helper stored encrypted blobs. Then it relayed
metadata.

Now it forwards history.

Operations.\
Patches.\
Version graphs.

The helper still cannot read the data.\
It still cannot decide truth.\
It still cannot resolve conflicts.

It simply helps replicas find each other.

Coordination without authority.

------------------------------------------------------------------------

# Sync Without Trust in Time

Traditional systems rely on trusted ordering.

Databases use transactions.\
Servers assign timestamps.\
Leaders decide winners.

Sovereign systems cannot depend on any of these.

Ordering emerges from causality.\
Merging emerges from mathematics.\
Consistency emerges from replication.

We removed trust from storage.\
We removed trust from identity.\
We removed trust from access control.

Sync removes trust from time and ordering.

------------------------------------------------------------------------

# Where This Leads Next

Our data can now:

Be verified.\
Be encrypted.\
Be shared.\
Be collaboratively edited.

But one major question remains.

How do people *find* the things they should sync?

How do names, discovery, and trust emerge without central directories?

To answer that, we must leave the realm of data and enter the realm of
coordination and discovery.

The next exploration begins there.
