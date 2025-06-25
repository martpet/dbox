interface Props {
  inodeId: string;
  isEnabled?: boolean;
}

export default function ButtonToggleChat({ inodeId, isEnabled }: Props) {
  return (
    <form method="post" action="/chat/toggle">
      <button name="inodeId" value={inodeId}>
        {isEnabled
          ? (
            <>
              <i class="ico-stop-circle" />Stop Chat
            </>
          )
          : (
            <>
              <i class="ico-play-fill" />Start Chat
            </>
          )}
      </button>
    </form>
  );
}
