import React, { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';

const TextMaskCustom = forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(#@%*) 000-0000"
      definitions={{
        "#": /[0-0]/,
        "@": /[4]/,
        "%": /[1-2]/,
        "*": /[2-4-6]/,
      }}
      inputRef={ref}
      onAccept={(value, mask) => onChange({ target: { name: props.name, value: mask._unmaskedValue } })}
      overwrite
    />
  );
});

export default TextMaskCustom;

