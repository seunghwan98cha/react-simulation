import './App.css';
import React, { useRef, useState, useEffect } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [tool, setTool] = useState('road'); 
  const [selectedEndPoint, setSelectedEndPoint] = useState(null); 
  const [showComboBox, setShowComboBox] = useState({ show: false, x: 0, y: 0 });
  const [laneOptions, setLaneOptions] = useState(["lane 1", "lane 2", "lane 3"]);
  const [selectedLane, setSelectedLane] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
      drawArrow(ctx, line.start, line.end);
    });

    if (currentLine) {
      ctx.beginPath();
      ctx.moveTo(currentLine.start.x, currentLine.start.y);
      ctx.lineTo(currentLine.end.x, currentLine.end.y);
      ctx.stroke();
      drawArrow(ctx, currentLine.start, currentLine.end);
    }

  }, [lines, currentLine]);

  const drawArrow = (ctx, start, end) => {
    const middleX = (start.x + end.x) / 2;
    const middleY = (start.y + end.y) / 2;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);

    const length = 8; 
    const arrowGap = 3; 

    ctx.beginPath();
    ctx.moveTo(middleX, middleY);
    ctx.lineTo(middleX - length * Math.cos(angle + Math.PI / 4),
      middleY - length * Math.sin(angle + Math.PI / 4));
    ctx.moveTo(middleX, middleY);
    ctx.lineTo(middleX - length * Math.cos(angle - Math.PI / 4),
      middleY - length * Math.sin(angle - Math.PI / 4));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(middleX + arrowGap * Math.cos(angle),
      middleY + arrowGap * Math.sin(angle));
    ctx.lineTo(middleX + arrowGap * Math.cos(angle) - length * Math.cos(angle + Math.PI / 4),
      middleY + arrowGap * Math.sin(angle) - length * Math.sin(angle + Math.PI / 4));
    ctx.moveTo(middleX + arrowGap * Math.cos(angle),
      middleY + arrowGap * Math.sin(angle));
    ctx.lineTo(middleX + arrowGap * Math.cos(angle) - length * Math.cos(angle - Math.PI / 4),
      middleY + arrowGap * Math.sin(angle) - length * Math.sin(angle - Math.PI / 4));
    ctx.stroke();
  };

  const isPointOnLine = (point, line) => {
    const { x, y } = point;
    const { start, end } = line;

    const d = ((end.y - start.y) * x - (end.x - start.x) * y + end.x * start.y - end.y * start.x) /
      Math.sqrt((end.y - start.y) ** 2 + (end.x - start.x) ** 2);

    return Math.abs(d) < 5;
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) return; 

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    
    if (tool === 'eraser') {
      const lineToRemove = lines.find(line => isPointOnLine({ x, y }, line));
      if (lineToRemove) {
        setLines(prevLines => prevLines.filter(line => line !== lineToRemove));
      }
      return;
    }
    
    const lineToResize = lines.find(line =>
      (Math.abs(line.start.x - x) < 5 && Math.abs(line.start.y - y) < 5) ||
      (Math.abs(line.end.x - x) < 5 && Math.abs(line.end.y - y) < 5)
    );

    if (lineToResize) {
      if (Math.abs(lineToResize.start.x - x) < 5 && Math.abs(lineToResize.start.y - y) < 5) {
        setSelectedEndPoint('start');
      } else {
        setSelectedEndPoint('end');
      }
      setCurrentLine(lineToResize);
      setLines(prevLines => prevLines.filter(line => line !== lineToResize));
      return;
    }

    setCurrentLine({
      start: { x, y },
      end: { x, y }
    });
  };

  const handleMouseMove = (e) => {
    if (!currentLine) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (selectedEndPoint) {
      setCurrentLine(prevLine => ({
        ...prevLine,
        [selectedEndPoint]: { x, y }
      }));
      return;
    }

    setCurrentLine(prevLine => ({
      ...prevLine,
      end: { x, y }
    }));
  };

  const handleMouseUp = (e) => {
    if (!currentLine) return;

    setLines(prevLines => [...prevLines, currentLine]);
    setCurrentLine(null);
    setSelectedEndPoint(null);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();

    if (tool === 'road') {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      const clickedLine = lines.find(line => isPointOnLine({ x, y }, line));

      if (clickedLine) {
        setShowComboBox({ show: true, x: e.clientX, y: e.clientY });
      } else {
        setShowComboBox({ show: false, x: 0, y: 0 });
      }
    }
  };

  const comboBoxStyle = {
    position: 'absolute',
    top: showComboBox.y,
    left: showComboBox.x,
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid black'
  };

  const handleLaneSelect = (option) => {
    setSelectedLane(option);
    setShowComboBox({ show: false, x: 0, y: 0 });
  };
  const buttonBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    width: '60px',
    marginRight: '20px'
};

  const appStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: '100%',
  };

  return (
    <div className="App" style={appStyle}>
      <div style={buttonBoxStyle}>
        <button onClick={() => setTool('road')}>Road</button>
        <button onClick={() => setTool('eraser')}>Eraser</button>
        <button onClick={() => setLines([])}>Clear</button>
      </div>
      <canvas 
        ref={canvasRef} 
        width={1500} 
        height={1200} 
        style={{ border: '2px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
      {showComboBox.show && (
        <div style={comboBoxStyle}>
          {laneOptions.map(option => (
            <div key={option} onClick={() => handleLaneSelect(option)}>
              {option}
            </div>
          ))}
          <div>
            lane: <input type="number" placeholder="Enter number" onChange={(e) => setSelectedLane(`lane ${e.target.value}`)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;