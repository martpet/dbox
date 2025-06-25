import {
  PRICE_PER_GB_CENTS,
  SITE_NAME,
  SITE_SHORT_DESC,
} from "../util/consts.ts";

interface Props {
  noLogo?: boolean;
  noName?: boolean;
  noSubline?: boolean;
  noFeatures?: boolean;
}

export default function AboutSite(props: Props) {
  const { noLogo, noName, noSubline, noFeatures } = props;
  const pricePerGb = PRICE_PER_GB_CENTS / 100;

  return (
    <section class="about-site prose">
      {!noLogo && <i class="ico-box-fill logo" />}

      {!noName && (
        <p class="subline" role="presentation">
          {SITE_NAME}
        </p>
      )}

      {!noSubline && (
        <h1 class="title">
          {SITE_SHORT_DESC}
        </h1>
      )}

      {!noFeatures && (
        <div class="card">
          <ul>
            <li>No expiration</li>
            <li>Unlimited downloads</li>
            <li>Custom file access</li>
            <li>
              <strong>
                Pay ${pricePerGb} per GB uploaded
              </strong>
            </li>
          </ul>
        </div>
      )}

      <footer>
        <nav>
          <ul>
            <li>
              <a href="/terms">Terms</a>
            </li>
            <li>
              <a href="/privacy">Privacy</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </footer>
    </section>
  );
}
