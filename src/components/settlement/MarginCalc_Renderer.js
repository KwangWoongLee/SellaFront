import { logger, replace_1000, revert_1000, time_format, time_format_none_time } from 'util/com';

export const SumPLRenderer = ({ data }) => {
  if (data && data.connect_flag == false) {
    return (
      <>
        <span className="center unconnected">미연결</span>
      </>
    );
  }

  return (
    <>
      {data.sum_profit_loss == '-' ||
      isNaN(data.sum_profit_loss) ||
      (data.sum_profit_loss != 0 && !data.sum_profit_loss) ||
      data.sum_profit_loss === '' ||
      data.sum_profit_loss === null ? (
        <>
          <span className="center txt_999">
            계산 전
            {/* <br />
            {'-'} */}
          </span>
        </>
      ) : (
        <>
          {data.sum_profit_loss > 0 ? (
            <>
              <span className="profit">
                <i>이익</i>
                <br />
                {replace_1000(data.sum_profit_loss)}
              </span>
            </>
          ) : (
            <>
              <span className="loss">
                <i>손해</i>
                <br />
                {replace_1000(data.sum_profit_loss)}
              </span>
            </>
          )}
        </>
      )}
    </>
  );
};

export const PLRenderer = ({ data }) => {
  if (data && data.connect_flag == false) {
    return (
      <>
        <span className="center unconnected">미연결</span>
      </>
    );
  }

  return (
    <>
      {data.profit_loss == '-' ||
      isNaN(data.profit_loss) ||
      (data.profit_loss != 0 && !data.profit_loss) ||
      data.profit_loss === '' ||
      data.profit_loss === null ? (
        <>
          <span className="center txt_999">
            계산 전
            {/* <br />
            {'-'} */}
          </span>
        </>
      ) : (
        <>
          {data.profit_loss > 0 ? (
            <>
              <span className="profit center">
                <i>이익</i>
                <br />
                {replace_1000(data.profit_loss)}
              </span>
            </>
          ) : (
            <>
              <span className="loss center">
                <i>손해</i>
                <br />
                {replace_1000(data.profit_loss)}
              </span>
            </>
          )}
        </>
      )}
    </>
  );
};

export const _30006Renderer = ({ data }) => {
  return (
    <>
      {data[30006] && `${replace_1000(revert_1000(data[30006]))}`}

      {data[30001] && (
        <>
          <span class="subtxt">({replace_1000(revert_1000(data[30001]))})</span>
        </>
      )}
    </>
  );
};

export const _30047Renderer = ({ data }) => {
  return (
    <>
      {data[30047] ? `${replace_1000(revert_1000(data[30047]))}` : `0`}

      {data[30047] && data['30047_additional'] && (
        <>
          <span class="subtxt">
            ({replace_1000(revert_1000(((data[30047] * Number(data['30047_additional'])) / 100).toFixed(0)))})
          </span>
        </>
      )}
    </>
  );
};

export const OptionCellRenderer = ({ data }) => {
  return (
    <>
      {data[30008]}
      {data[30011] && data[30011]}
      {data[30012] && data[30012]}
    </>
  );
};
