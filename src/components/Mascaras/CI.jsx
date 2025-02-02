const TextMaskCustom2 = forwardRef(function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00000000"
        inputRef={ref}
        onAccept={(value, mask) => {
          onChange({ target: { name: props.name, value: mask._unmaskedValue } });
        }}
        overwrite
      />
    );
  });