 /* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';

function Dropdown({ selectedLang, setSelectedLang }: { selectedLang: string, setSelectedLang: (lang: string) => void }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (option: string) => {
    setSelectedLang(option);
    handleClose();
  };

  return (
    <div>
      <Button onClick={handleClick}>
        {selectedLang}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSelect('en_XX')}>English</MenuItem>
        <MenuItem onClick={() => handleSelect('fr_XX')}>Français</MenuItem>
        <MenuItem onClick={() => handleSelect('es_XX')}>Español</MenuItem>
        <MenuItem onClick={() => handleSelect('it_IT')}>Italiano</MenuItem>
        <MenuItem onClick={() => handleSelect('ru_RU')}>Russian</MenuItem>
        <MenuItem onClick={() => handleSelect('ja_XX')}>Japanese</MenuItem>
        <MenuItem onClick={() => handleSelect('ko_KR')}>Korean</MenuItem>
        <MenuItem onClick={() => handleSelect('ar_AR')}>Arabic</MenuItem>
        <MenuItem onClick={() => handleSelect('de_DE')}>German</MenuItem>
        <MenuItem onClick={() => handleSelect('pt_XX')}>Portuguese</MenuItem>
        <MenuItem onClick={() => handleSelect('zh_CN')}>Chinese</MenuItem>
        <MenuItem onClick={() => handleSelect('hi_IN')}>Hindi</MenuItem>
      </Menu>
    </div>
  );
}

export default Dropdown;
