"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, UserRound, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import styles from "./UserDetailsPopup.module.css";

type AccountTab = "account" | "subscription";

export const UserDetailsPopup = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AccountTab>("account");
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpen.current) {
        triggerRef.current?.focus();
        wasOpen.current = false;
      }
      return;
    }

    wasOpen.current = true;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectTab = (tab: AccountTab) => {
    setActiveTab(tab);
    setNotice("");
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setNotice("Unable to sign out. Please try again.");
        setSigningOut(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setNotice("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.accountButton}
        type="button"
        aria-label="Open account details"
        title="Account details"
        onClick={() => setIsOpen(true)}
      >
        <UserRound aria-hidden="true" size={19} strokeWidth={1.8} />
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            ref={panelRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-dialog-title"
          >
            <header className={styles.dialogHeader}>
              <div className={styles.profileIdentity}>
                <span className={styles.avatar} aria-hidden="true">
                  <UserRound size={22} strokeWidth={1.7} />
                </span>
                <div>
                  <p className={styles.eyebrow}>BASELINE ACCOUNT</p>
                  <h2 id="account-dialog-title">Account details</h2>
                </div>
              </div>
              <button
                ref={closeRef}
                className={styles.closeButton}
                type="button"
                aria-label="Close account details"
                onClick={() => setIsOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </header>

            <div className={styles.tabs} role="tablist" aria-label="Account sections">
              <button
                id="account-tab"
                className={activeTab === "account" ? styles.activeTab : styles.tab}
                type="button"
                role="tab"
                aria-selected={activeTab === "account"}
                aria-controls="account-panel"
                onClick={() => selectTab("account")}
              >
                <UserRound aria-hidden="true" size={15} />
                Account
              </button>
              <button
                id="subscription-tab"
                className={activeTab === "subscription" ? styles.activeTab : styles.tab}
                type="button"
                role="tab"
                aria-selected={activeTab === "subscription"}
                aria-controls="subscription-panel"
                onClick={() => selectTab("subscription")}
              >
                <CreditCard aria-hidden="true" size={15} />
                Subscription
              </button>
            </div>

            {activeTab === "account" ? (
              <section
                id="account-panel"
                className={styles.tabPanel}
                role="tabpanel"
                aria-labelledby="account-tab"
              >
                <dl className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <dt>Name</dt>
                    <dd>{session?.user.name ?? "Loading account"}</dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>Email</dt>
                    <dd>{session?.user.email ?? "—"}</dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>Sign-in method</dt>
                    <dd>Email and password</dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>Account status</dt>
                    <dd>
                      <span className={styles.statusDot} />
                      {session?.user.emailVerified ? "Verified" : "Pending verification"}
                    </dd>
                  </div>
                </dl>
                <div className={styles.actionRow}>
                  <div>
                    <h3>Sign-in security</h3>
                    <p>Your account is secured with email verification.</p>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    disabled={signingOut}
                    onClick={signOut}
                  >
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </section>
            ) : (
              <section
                id="subscription-panel"
                className={styles.tabPanel}
                role="tabpanel"
                aria-labelledby="subscription-tab"
              >
                <div className={styles.planSummary}>
                  <div>
                    <p className={styles.eyebrow}>CURRENT PLAN</p>
                    <h3>Free preview</h3>
                  </div>
                  <span className={styles.planBadge}>DEMO</span>
                </div>
                <dl className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <dt>Billing status</dt>
                    <dd>No billing information saved</dd>
                  </div>
                  <div className={styles.detailRow}>
                    <dt>Next renewal</dt>
                    <dd>Not applicable</dd>
                  </div>
                </dl>
                <div className={styles.subscriptionAction}>
                  <p>Subscription controls are placeholders until billing is configured.</p>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => setNotice("Subscription management will be available when billing is configured.")}
                  >
                    Manage subscription
                  </button>
                </div>
              </section>
            )}

            {notice && <p className={styles.notice} role="status">{notice}</p>}
          </div>
        </div>
      )}
    </>
  );
};